const router = require('express').Router();
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const Follow = require('../models/Follow');
const isLoggedIn = require('../middlewares/index');
const interestsDB = require('../utils/interests');
const computeFollows = require('../utils/computeFollows');
const Like = require('../models/Like');



// @desc    Like & dislike posts
// @route   POST /like/edit/:albumId
// @access  Private
router.post('/edit/:albumId', isLoggedIn, async (req, res, next) => {
    const { albumId } = req.params;
    const userId = req.session.currentUser._id;
    try {
        const like = await Like.findOne({ albumId: albumId, likeUserId: userId });
        if(!like) {
            try {
                const newLike = await Like.create({albumId: albumId, likeUserId: userId})
                res.redirect('back');
            } catch (error) {
                next(error);
            }
        } else {
            try {
                await Like.findOneAndDelete({albumId: albumId, likeUserId: userId });
                res.redirect('back');
            } catch (error) {
                next(error);
            }
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;