const router = require('express').Router();
const app = require('../app.js');
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const isLoggedIn = require('../middlewares/index');

// @desc    Profile Page. Content = Posts
// @route   GET /profile/posts
// @access  Private

router.get('/posts', isLoggedIn, async (req, res, next) => {
    const userId = req.session.currentUser._id;
    try {
        const user = await User.findById(userId);
        res.render('profile/profile', {user});
    } catch (error) {
        next(error);
    }
})

module.exports = router;