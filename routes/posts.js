const router = require('express').Router();
const Album = require('../models/Album.js');
const {isLoggedIn, isTribe} = require('../middlewares/index');
const interestsDB = require('../utils/interests');
const fileUploader = require('../config/cloudinary.config');

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
router.post('/new', isLoggedIn, isTribe, fileUploader.single('image'), async (req, res, next) => {
    const user = req.session.currentUser;
    const { title, description, genres } = req.body;
    const image = req.file.path;
    if (!image || !title || !genres ) {
        res.render(res.render('posts/new-album', {user, interestsDB, error: 'Please, fill all the required fields'}))
    } else {
        try {
            const createdAlbum = await Album.create({title, description, genres, image, tribe: user._id });
            res.redirect(`/posts/new/${createdAlbum._id}/add-tracks`);
        } catch (error) {
            next(error);  
        }   
    }
});

// @desc    Adding tracks to the album view
// @route   GET /posts/new/:albumId/add-tracks
// @access  Private
router.get('/new/:albumId/add-tracks', isLoggedIn, isTribe, async (req, res, next) => {
    const user = req.session.currentUser;
    const {albumId} = req.params;
    try {
        const album = await Album.findById(albumId);
        res.render('posts/add-tracks', {user, album});
    } catch (error) {
        next(error);
    }
});

// @desc    Adding tracks to the album get tracks
// @route   POST /posts/new/:albumId/add-tracks
// @access  Private
router.post('/new/:albumId/add-tracks',isLoggedIn, isTribe, async (req, res, next) => {
    const {tracks, trackNames} = req.body;
    const tracksDB = [];
    const user = req.session.currentUser;
    const {albumId} = req.params;
    try {
        const album = await Album.findById(albumId);
        console.log('tracks', tracks);
        console.log('trackNames', trackNames);
        for (let trackIdx = 0; trackIdx < tracks.length; trackIdx++) {
            if (trackNames[trackIdx].length === 0 || tracks[trackIdx].length === 0) {
                console.log('hereeee');
                res.render('posts/add-tracks', {user, album, error: 'All tracks must have a name and a file associated. Try again'});
                return;
            } else {
                tracksDB.push({
                    trackUrl: tracks[trackIdx],
                    trackName: trackNames[trackIdx],
                    trackNumber: trackIdx
                });
            }
        }
        const updatedAlbum = await Album.findByIdAndUpdate(albumId, {tracks: tracksDB}, {new: true});
        console.log(updatedAlbum);
        res.redirect('/profile/posts');
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
        res.render(`posts/edit/:${albumId}`, {user, album, checkedGenres, notCheckedGenres, error: 'Please, fill all the required fields'});
    } else {
        try {
            const editedAlbum = await Album.findByIdAndUpdate(albumId, { image, title, description, genres, tribe: user._id });
            res.redirect('/profile/posts');
        } catch (error) {
            next(error);  
        }   
    }
});

// @desc    View details of the album
// @route   GET posts/detail/:albumId
// @access  Private
router.get('/detail/:albumId', isLoggedIn, async (req, res, next) => {
    const user = req.session.currentUser;
    const { albumId } = req.params;
    try {
        const album = await Album.findById(albumId);
        res.render('posts/album-detail', {user, album});
    } catch (error) {
        next(error);
    }
})

module.exports = router;