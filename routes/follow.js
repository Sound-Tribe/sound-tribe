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
        const existentFollow = await Follow.find({ followeeId: followeeId, followerId: followerId });
        console.log(existentFollow);
        if (existentFollow.length != 0) {
            //redirect to unfollow
        } else {
            await Follow.create({ followeeId: followeeId, followerId: followerId });
            res.redirect(`/profile/view/${followeeId}/posts`);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;