const router = require('express').Router();
const app = require('../app.js');
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const isLoggedIn = require('../middlewares/index');
const interestsDB = require('../utils/interests');

// @desc    Get view for new post (album) page
// @route   GET /posts/new
// @access  Private
router.get('/new', isLoggedIn, (req, res ,next) => {
    const user = req.session.currentUser;
    res.render('posts/newAlbum', { user, interestsDB });
});

// @desc    Gets info of new post (album) 
// @route   POST /posts/new
// @access  Private
router.post('/new', isLoggedIn, async (req, res, next) => {
    const user = req.session.currentUser;
    const { image, title, description, genres } = req.body;
    if (!image || !title || !genres ) {
        res.render(res.render('posts/newAlbum', {user, interestsDB, error: 'Please, fill all the required fields'}))
    } else {
        try {
            const createdAlbum = await Album.create({ image, title, description, genres, tribe: user._id });
            // This is the correcy redirect
            // res.redirect(`/posts/new/add-tracks/${createdAlbum._id}`);
            // But for testing purposes:
            res.redirect('/profile/posts');
        } catch (error) {
            next(error);  
        }   
    }
})

// @desc    Delete album
// @route   GET /posts/delete/:albumId
// @access  Private
router.get('/delete/:albumId', isLoggedIn, async (req, res, next) => {
    const { albumId } = req.params;
    try {
       await Album.deleteOne(albumId);
       res.redirect('/profile/posts'); 
    } catch (error) {
        next(error);
    }
})

// @desc    Edit album
// @route   GET /posts/edit/:albumId
// @access  Private
router.get('/edit/:albumId', isLoggedIn, async (req, res, next) => {
    const { albumId } = req.params;
    const user = req.session.currentUser;
    try {
        const album = await Album.findById(albumId);
        const checkedGenres = album.genres
        const notCheckedGenres = interestsDB.filter((item) => !checkedGenres.includes(item));
        res.render('posts/edit-album', { user, album, checkedGenres, notCheckedGenres });
    } catch (error) {
        next(error);
    }
})

// @desc    Edit album
// @route   POST /posts/edit/:albumId
// @access  Private
router.post('/edit/:albumId', isLoggedIn, async (req, res, next) => {
    const user = req.session.currentUser;
    const { albumId } = req.params;
    const { image, title, description, genres } = req.body;
    if (!image || !title || !genres ) {
        const album = await Album.findById(albumId);
        const checkedGenres = album.genres
        const notCheckedGenres = interestsDB.filter((item) => !checkedGenres.includes(item));
        res.render(res.render(`posts/edit/:${albumId}`, {user, album, checkedGenres, notCheckedGenres, error: 'Please, fill all the required fields'}))
    } else {
        try {
            const editedAlbum = await Album.findByIdAndUpdate(albumId, { image, title, description, genres, tribe: user._id });
            res.redirect('/profile/posts');
        } catch (error) {
            next(error);  
        }   
    }

})
module.exports = router;