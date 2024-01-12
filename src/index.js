require("dotenv").config();
const {client, startWhatsAppClient } = require("./services/whatsapp");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);

const { strategy } = require("./config/auth");
startWhatsAppClient();

const express = require("express");
const bodyParser = require('body-parser');
const path = require("path");

const expressSession = require("express-session");
const passport = require("passport");

const authRouter = require("./routers/auth");
const dashboardRouter = require("./routers/dashboard");
const { getUser, postUser } = require("./services/user");

/**
 * App Variables
 */

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
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

// pass user to all views
app.use(async (req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  if (res.locals.isAuthenticated) {
    const userId = req.session.passport.user.id;
    let user = await getUser(userId);
    if (!user) {
      const displayName =
        req.session.passport.user.displayName ||
        req.session.passport.user.nickname ||
        userId;
      const picture = req.session.passport.user.picture || null;
      user = await postUser(userId, displayName, picture);
      console.log("User created:", user.displayName, user.id);
    }
    
    req.user = user;
  }

  next();
});



app.use("/", authRouter);
app.use("/", dashboardRouter);

app.get("/", (req, res) => {
  res.render("index", {
    title: "Home Page",
    isAuthenticated: req.isAuthenticated(),
  });
});


app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
