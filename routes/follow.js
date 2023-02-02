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
        if (existentFollow.length != 0) {
            res.redirect(`/follow/delete/${followeeId}`);
        } else {
            await Follow.create({ followeeId: followeeId, followerId: followerId });
            await User.findOneAndUpdate({_id :followeeId}, {$inc : {'followers' : 1}});
            const updatedUser = await User.findOneAndUpdate({_id :followerId}, {$inc : {'following' : 1}}, { new: true });
            req.session.currentUser = updatedUser;
            res.redirect(`/profile/view/${followeeId}/posts`);
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
        await Follow.findOneAndDelete({ followeeId: followeeId, followerId: followerId });
        await User.findOneAndUpdate({_id :followeeId}, {$inc : {'followers' : -1}});
        const updatedUser = await User.findOneAndUpdate({_id :followerId}, {$inc : {'following' : -1}}, {new: true});
        req.session.currentUser = updatedUser;
        res.redirect(`/profile/view/${followeeId}/posts`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;