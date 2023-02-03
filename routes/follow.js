const router = require('express').Router();
const Follow = require('../models/Follow.js');
const User = require('../models/User.js');
const isLoggedIn = require('../middlewares/index');

// @desc    Creates a new follow relation
// @route   POST /follow/new/:followeeId
// @access  Private
router.post('/new/:followeeId', isLoggedIn, async (req, res, next) => {
    const { followeeId } = req.params;
    const followerId = req.session.currentUser._id;
    try {
        const followee = await User.findById(followeeId);
        if (followee.type != 'tribe') {
            // Adds extra validation, for only tribes can be followed
            res.redirect('back');
        }
        const existentFollow = await Follow.find({ followeeId: followeeId, followerId: followerId });
        if (existentFollow.length != 0) {
            res.redirect(`/follow/delete/${followeeId}`);
        } else {
            await Follow.create({ followeeId: followeeId, followerId: followerId });
            res.redirect('back');
        }
    } catch (error) {
        next(error);
    }
});

// @desc    Deletes an existing follow relation
// @route   POST /follow/delete/:followeeId
// @access  Private
router.get('/delete/:followeeId', isLoggedIn, async (req, res, next) => {
    const { followeeId } = req.params;
    const followerId = req.session.currentUser._id;
    try {
        const followee = await User.findById(followeeId);
        if (followee.type != 'tribe') {
            // Adds extra validation, for only tribes can be followed
            res.redirect('back');
        }
        await Follow.findOneAndDelete({ followeeId: followeeId, followerId: followerId });
        res.redirect(`/profile/view/${followeeId}/posts`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;