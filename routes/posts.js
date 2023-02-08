const router = require('express').Router();
const Album = require('../models/Album.js');
const {isLoggedIn, isTribe} = require('../middlewares/index');
const interestsDB = require('../utils/interests');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @desc    Get view for new post (album) page
// @route   GET /posts/new
// @access  Private
router.get('/new', isLoggedIn, isTribe, (req, res ,next) => {
    const user = req.session.currentUser;
    res.render('posts/new-album', { user, interestsDB });
});

// @desc    Gets info of new post (album) 
// @route   POST /posts/new
// @access  Private
router.post('/new', isLoggedIn, isTribe, async (req, res, next) => {
    const user = req.session.currentUser;
    const { title, description, genres } = req.body;
    if (!title || !genres ) {
        res.render(res.render('posts/new-album', {user, interestsDB, error: 'Please, fill all the required fields'}))
    } else {
        try {
            const createdAlbum = await Album.create({title, description, genres, tribe: user._id });
            res.redirect(`/posts/new/add-photo/${createdAlbum._id}`);
        } catch (error) {
            next(error);  
        }   
    }
});

// @desc    Get view for upload photo to album
// @route   GET /posts/new/add-photo/:albumId
// @access  Private
router.get('/new/add-photo/:albumId', isLoggedIn, isTribe, async (req, res, next) => {
    const user = req.session.currentUser;
    const {albumId} = req.params;
    try {
        const album = await Album.findById(albumId);
        res.render('posts/new-album-image', {user, album});
    } catch (error) {
        next(error);
    }
});

// @desc    Post uploaded photo to album
// @route   POST /posts/new/add-photo/:albumId
// @access  Private
router.post('/new/add-photo/:albumId', isLoggedIn, isTribe, upload.single('albumImage'), async (req, res, next) => {
    const user = req.session.currentUser;
    const {albumId} = req.params;
    try {
        const album = await Album.findByIdAndUpdate(albumId, {image: {
            data: req.file.buffer,
            contentType: req.file.mimetype
        }}, {new: true});
        res.render('posts/testImg', {user, album});
    } catch (error) {
        next(error);
    }
    
});

// @desc    Delete album
// @route   GET /posts/delete/:albumId
// @access  Private
router.get('/delete/:albumId', isLoggedIn, isTribe, async (req, res, next) => {
    const { albumId } = req.params;
    const user = req.session.currentUser;
    try {
        const album = await Album.findById(albumId);
        if (user._id != album.tribe) {
            res.redirect('back');
        } else {
            await Album.findByIdAndDelete(albumId);
            res.redirect('/profile/posts');
        }
    } catch (error) {
        next(error);
    }
})

// @desc    Edit album
// @route   GET /posts/edit/:albumId
// @access  Private
router.get('/edit/:albumId', isLoggedIn, isTribe, async (req, res, next) => {
    const { albumId } = req.params;
    const user = req.session.currentUser;
    try {
        const album = await Album.findById(albumId);
        if (user._id != album.tribe) {
            res.redirect('back');
        } else {
            const checkedGenres = album.genres
            const notCheckedGenres = interestsDB.filter((item) => !checkedGenres.includes(item));
            res.render('posts/edit-album', { user, album, checkedGenres, notCheckedGenres });
        }
    } catch (error) {
        next(error);
    }
})

// @desc    Edit album
// @route   POST /posts/edit/:albumId
// @access  Private
router.post('/edit/:albumId', isLoggedIn, isTribe, async (req, res, next) => {
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