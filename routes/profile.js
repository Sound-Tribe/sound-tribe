const router = require('express').Router();
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const isLoggedIn = require('../middlewares/index');
const interestsDB = require('../data/interests');


// @desc    Profile Page. Content = Posts
// @route   GET /profile/posts
// @access  Private
router.get('/posts', isLoggedIn, async (req, res, next) => {
    const user = req.session.currentUser;
    try {
        const posts = await Album.find({ tribe: user._id});
        res.render('profile/profile', {user, posts});
    } catch (error) {
        next(error);
    }
});

// @desc    Profile Page. Content = Liked
// @route   GET /profile/liked
// @access  Private
router.get('/liked', isLoggedIn, async (req, res, next) => {
    const userId = req.session.currentUser._id;
    try {
        const user = await User.findById(userId);
        // Should retreive all liked posts from user
        // For testing purposes
        const content =[{
            title: 'album1Liked',
            description: 'something'
        },{
            title: 'album2Liked',
            description: 'somethingasdf'
        }];
        res.render('profile/profile', {user, liked: content});
    } catch (error) {
        next(error);
    }
});

// @desc    Profile Page. Content = Calendar
// @route   GET /profile/calendar
// @access  Private
router.get('/calendar', isLoggedIn, async (req, res, next) => {
    const userId = req.session.currentUser._id;
    try {
        const user = await User.findById(userId);
        // Should retreive all calendar events from user
        // For testing purposes
        const content =[{
            date: 'Wednesday 1st',
            location: 'Barcelona'
        },{
            date: 'Thursday 2nd',
            location: 'Valencia'
        }];
        res.render('profile/profile', {user, calendar: content});
    } catch (error) {
        next(error);
    }
})

// @desc    Profile Edit Page.
// @route   GET /profile/edit
// @access  Private
router.get('/edit', isLoggedIn, async (req, res, next) => {
    const userId = req.session.currentUser._id;
    try {
        const user = await User.findById(userId);
        res.render('profile/edit-profile', { user })
    } catch (error) {
        next (error);
    }
});

// @desc    Profile Edit Page
// @route   POST /profile/edit
// @access  Private
router.post('/edit', isLoggedIn, async (req, res, next) => {
    const { username, picture, country, city, socialMedia } = req.body;
    let updatedInfo = {};
  if(username) {
    updatedInfo.username = username;
  }  
  if (picture) {
    updatedInfo.picture = picture;
  }
  if (country) {
    updatedInfo.country = country;
  }
  if (city) {
    updatedInfo.city = city;
  }
  if (socialMedia) {
    updatedInfo.socialMedia = socialMedia;
  }
  const userId = req.session.currentUser._id;
  const newUser = await User.findByIdAndUpdate(userId, updatedInfo, { new: true });
  req.session.currentUser = newUser;
  res.redirect('/profile/edit/interests');
});

router.get('/edit/interests', async (req, res, next) => {
    const user = req.session.currentUser;
    const { interests } = await User.findById(user._id);
    const notCheckedInterests = interestsDB.filter((item) => !interests.includes(item));
    res.render('profile/edit-interests', {user, interests, notCheckedInterests});
})

module.exports = router;