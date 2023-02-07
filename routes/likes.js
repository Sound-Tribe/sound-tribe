const router = require('express').Router();
const {isLoggedIn} = require('../middlewares/index');
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
                await Like.create({albumId: albumId, likeUserId: userId})
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