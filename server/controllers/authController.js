const mongoos = require("mongoose");
const User = mongoos.model("User");
const passport = require("passport");

exports.validateSignup = (req, res, next) => {
  req.sanitizeBody("name");
  req.sanitizeBody("email");
  req.sanitizeBody("password");

  req.checkBody("name", "Enter a name").notEmpty();
  req
    .checkBody("name", "Name must be between 4 and 10 characters")
    .isLength({ min: 4, max: 10 });

  req
    .checkBody("email", "Enter a valid email")
    .isEmail()
    .normalizeEmail();

  req.checkBody("password", "Enter a password").notEmpty();
  req
    .checkBody("password", "Password must be between 4 and 10 characters")
    .isLength({ min: 4, max: 10 });

  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors[0].msg;
    // const firstError = errors.map(error => error.msg)[0]

    return res.status(400).send(firstError);
  }
  next();
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await new User({ name, email, password });
  await User.register(user, password, (err, user) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(user);
  });
};

exports.signin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      res.status(500).send(err.message);
    }
    if (!user) {
      return res.status(400).json(info.message);
    }

    req.logIn(user, err => {
      if (err) {
        return res.status(500).json(err.message);
      }
      res.json(user);
    });
  })(req, res, next);
};

exports.signout = (req, res, next) => {
  res.clearCookie("next-cookie.sid");
  req.logout();
  res.json({ massage: "you are now signed out" });
};

exports.checkAuth = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/signin");
};
