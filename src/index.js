const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { addStreak, getLeaderboard, getGroup } = require("./utils");
require("dotenv").config();
const User = require("./models/User");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI)

const startTime = Date.now();

async function startWhatsAppClient() {
  const client = await new Client({
    authStrategy: new LocalAuth(),
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.on("message", async (message) => {
    // Group
    const groupId = message.from;
    const group = await getGroup(groupId);
    // Check if the message is received after the script started
    const messageTimestamp = message.timestamp * 1000;
    if (messageTimestamp > startTime) {
      const participantId = message.author;
      const participantName = message._data.notifyName;
      const groupId = message.from;
      const hasMedia = message.hasMedia;

      // Check if the message is from a group
      if (message._data.id.participant) {
        if (message.body === "!leaderboard") {
          const leaderboard = await getLeaderboard(groupId);
          console.log("Leaderboard requested from group", groupId);
          message.reply(leaderboard);
        } else {
          console.log(
            "Message received from group",
            groupId,
            "by participant",
            participantId,
            hasMedia ? "with media" : ""
          );
          // Call addStreak function
          addStreak(
            participantId,
            participantName,
            groupId,
            hasMedia,
            group.maxPoints
          );
        }
      }
    }
  });

  client.on("authenticated", (session) => {
    console.log("Authenticated!");
  });

  await client.initialize();
}

startWhatsAppClient();

const express = require("express");
const path = require("path");

const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

const authRouter = require("./routers/auth");
const dashboardRouter = require("./routers/dashboard");

/**
 * App Variables
 */

const app = express();
const port = process.env.PORT || "8000";

/**
 * Session Configuration (New!)
 */
const session = {
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: false,
};

if (app.get("env") === "production") {
  // Serve secure cookies, requires HTTPS
  session.cookie.secure = true;
}

/**
 * Passport Configuration (New!)
 */

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API
     * (resource server)
     * accessToken is the token to call the Auth0 API
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
    return done(null, profile);
  }
);

/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.use(expressSession(session));

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(async (req, res, next) => {
  console.log(req.session)
  res.locals.isAuthenticated = req.isAuthenticated();
  console.log("isAuthenticated", res.locals.isAuthenticated)
  if (res.locals.isAuthenticated) {
    const userId = req.session.passport.user.id;
    // get user from database. if user does not exist, create user
    try {
      let user = await User.findOne({ authId: userId });
      if (!user) {
        // User does not exist, so create a new user
        user = new User({
          authId: userId,
          displayName: req.session.passport.user.displayName || req.session.passport.user.nickname || userId,
          picture: req.session.passport.user.picture,
        });
        await user.save();
      }
      req.user = user;
    } catch (error) {
      console.error('Error fetching or creating user:', error);
    }
  }

  next();
});

app.use("/", authRouter);
app.use("/", dashboardRouter);

app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page', isAuthenticated: req.isAuthenticated() });
});

//run server

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});