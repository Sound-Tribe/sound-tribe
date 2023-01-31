const router = require('express').Router();
const app = require('../app.js');
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const isLoggedIn = require('../middlewares/index');

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

module.exports = router;