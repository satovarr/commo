const express = require("express");
const router = express.Router();
const passport = require("passport");
const querystring = require("querystring");

require("dotenv").config();

/**
 * Routes Definitions
 */

router.get(
  "/login",
  passport.authenticate("auth0", {
    scope: "openid email profile",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

router.get("/callback", (req, res, next) => {
  passport.authenticate("auth0", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) return next(err);

      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo || "/dashboard");
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logOut(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
