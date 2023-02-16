const router = require('express').Router();
const {isLoggedIn} = require('../middlewares/index');
const Like = require('../models/Like');

// @desc    Like & dislike posts
// @route   POST /like/edit/:albumId
// @access  Private
router.post('/edit/:albumId', isLoggedIn, async (req, res, next) => {
    const { albumId } = req.params;
    const userId = req.session.currentUser._id;
    let previousUrl = req.get('referer') || '/';
    if (previousUrl.includes('?scroll')) {
        previousUrl = previousUrl.split('?scroll')[0];
    }
    const scrollPosition = req.body.scrollPosition || 0;
    try {
        const like = await Like.findOne({ albumId: albumId, likeUserId: userId });
        if(!like) {
            await Like.create({albumId: albumId, likeUserId: userId})
            res.redirect(`${previousUrl}?scroll=${scrollPosition || 0}`);
        } else {
            await Like.findOneAndDelete({albumId: albumId, likeUserId: userId });
            res.redirect(`${previousUrl}?scroll=${scrollPosition || 0}`);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;