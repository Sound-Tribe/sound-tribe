const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const isLoggedIn = require('../middlewares/index');
const interestsDB = require('../utils/interests');

// @desc    Displays form view to sign up
// @route   GET /auth/signup
// @access  Public
router.get("/signup", async (req, res, next) => {
  res.render("auth/signup");
});

// @desc    Displays form view to log in
// @route   GET /auth/login
// @access  Public
router.get("/login", async (req, res, next) => {
  res.render("auth/login");
});

// @desc    Sends user auth data to database to authenticate user
// @route   POST /auth/login
// @access  Public
router.post("/login", async (req, res, next) => {
  const { usernameOrEmail, password } = req.body;
  const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(usernameOrEmail);
  const key = isEmail ? 'email' : 'username';
  // ⚠️ Add validations!
  if (!usernameOrEmail || !password) {
    res.render("auth/login", { error: "Introduce email and password to log in" });
    return;
  }
  try {
    const user = await User.findOne({ [key]: usernameOrEmail });
    if (!user) {
      res.render("auth/login", { error: "User not found" });
      return;
    } else {
      const match = await bcrypt.compare(
        password,
        user.hashedPassword
      );
      if (match) {
        // Remember to assign user to session cookie:
        req.session.currentUser = user;
        res.redirect("/");
      } else {
        res.render("auth/login", { error: "Unable to authenticate user" });
      }
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Sends user auth data to database to create a new user
// @route   POST /auth/signup
// @access  Public
router.post("/signup", async (req, res, next) => {
  const { email, password, username, type } = req.body;
  if (!email || !password || !username || !type) {
    res.render("auth/signup", { error: "All fields are necessary" });
    return;
  }
  const types = ['tribe', 'fan'];
  if (!types.includes(type)) {
    res.render("auth/signup", { error: 'Something went wrong with the type of account you are creating. Try again.'});
    return;
  }
  const regexPassword = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regexPassword.test(password)) {
    res.render("auth/signup", {
      error:
        "Password needs to contain at least 6 characters, one number, one lowercase and one uppercase letter.",
    });
    return;
  }
  const regexUsername =  /^[a-z0-9_-]{3,15}$/;
  if (!regexUsername.test(username)) {
    res.render("auth/signup", { error: 'Username can only contain characters from a-z, 0-9, "-" and "_"'});
    return;
  }
  try {
    const userUsernameDB = await User.findOne({ username: username });
    if (userUsernameDB) {
      res.render("auth/signup", {
        error: "Username already exists. Please try another one",
      });
      return;
    }
    const userMailDB = await User.findOne({ email: email });
    if (userMailDB) {
      res.render("auth/signup", {
        error: "This email already exists. Please try another one",
      });
      return;
    }
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ username, email, hashedPassword, type });
    req.session.currentUser = user;
    res.redirect("/auth/interests");
  } catch (error) {
    next(error);
  }
});

// @desc    After signup, prompts the user to select musical preferences
// @route   /auth/interests
// @access  Private
router.get('/interests', isLoggedIn, (req, res, next) => {
  const user = req.session.currentUser;
  res.render('profile/interests', { user, interestsDB });
});

// @desc    Sends the interests data to the user profile
// @route   /auth/interests
// @access  Private
router.post('/interests', isLoggedIn, async (req, res, next) => {
  const { genres } = req.body;
  // WIP here
  console.log(genres)
  const user = req.session.currentUser
  const userId = user._id;
  const wrongGenres = genres.filter(genre => !interestsDB.includes(genre));
  if (wrongGenres.length === 0) {
    try {
      await User.findByIdAndUpdate(userId, { interests: genres });
      res.redirect('/auth/complete-profile');
    } catch (error) {
      next(error);
    }
  } else {
    res.render('profile/interests', { user, interestsDB, error: 'Something went wrong. Try again' });
  }
  
});

// @desc    After choosing interests, prompts the user to complete profile info
// @route   /auth/complete-profile
// @access  Private
router.get('/complete-profile', (req, res, next) => {
  const user = req.session.currentUser;
  if (user.type === 'tribe') {
    user.isTribe = true;
  }
  res.render('profile/complete-info', {user});
});

// @desc    After choosing interests, prompts the user to complete profile info
// @route   /auth/complete-profile
// @access  Private
router.post('/complete-profile', async (req, res, next) => {
  const { picture, country, city, socialMedia } = req.body;
  let filledInfo = {};
  if (picture) {
    filledInfo.picture = picture;
  }
  if (country) {
    filledInfo.country = country;
  }
  if (city) {
    filledInfo.city = city;
  }
  if (socialMedia) {
    filledInfo.socialMedia = socialMedia;
  }
  const userId = req.session.currentUser._id;
  try {
    await User.findByIdAndUpdate(userId, filledInfo);
    res.redirect('/profile/posts');
  } catch (error) {
    next(error);
  }
});

// @desc    Destroy user session and log out
// @route   POST /auth/logout
// @access  Private
router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    } else {
      res.redirect("/auth/login");
    }
  });
});

module.exports = router;
