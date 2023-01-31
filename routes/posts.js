const router = require('express').Router();
const app = require('../app.js');
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const isLoggedIn = require('../middlewares/index');

// @desc    Get view for new post (album) page
// @route   GET /posts/new
// @access  Private
router.get('/new', isLoggedIn, (req, res ,next) => {
    const user = req.session.currentUser;
    res.render('posts/newAlbum', user);
});

// @desc    Gets info of new post (album) 
// @route   POST /posts/new
// @access  Private
router.post('/new', isLoggedIn, async (req, res, next) => {
    const user = req.session.currentUser;
    const { image, title, description, genres } = req.body;
    if (!image || !title || !genres ) {
        res.render(res.render('posts/newAlbum', {user, error: 'Please, fill all the required fields'}))
    } else {
        const createdAlbum = await Album.create({ image, title, description, genres, tribe: user._id });
        // This is the correcy redirect
        // res.redirect(`/posts/new/add-tracks/${createdAlbum._id}`);
        // But for testing purposes:
        res.redirect('/profile/posts');
    }
})

module.exports = router;