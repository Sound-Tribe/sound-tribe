const router = require('express').Router();
const Album = require('../models/Album.js');
const {isLoggedIn, isTribe} = require('../middlewares/index');
const interestsDB = require('../utils/interests');
const fileUploader = require('../config/cloudinary.config');
const spotifyApi = require('../utils/connectSpotify');
const isAudioFile = require('../utils/isAudio');

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

// @desc    Adding tracks to the album
// @route   POST /posts/new/:albumId/add-tracks
// @access  Private
router.post('/new/:albumId/add-tracks',isLoggedIn, isTribe, async (req, res, next) => {
    const {tracksForm, trackNamesForm} = req.body;
    let tracks = [];
    let trackNames = [];
    if (typeof tracksForm === 'string') {
        tracks.push(tracksForm);
        trackNames.push(trackNamesForm);
    } else {
        tracks = tracksForm.map(track => track);
        trackNames = trackNamesForm.map(name => name);
    }
    const tracksDB = [];
    const user = req.session.currentUser;
    const {albumId} = req.params;
    try {
        const album = await Album.findById(albumId);
        for (let trackIdx = 0; trackIdx < tracks.length; trackIdx++) {
            if (trackNames[trackIdx].length === 0 || tracks[trackIdx].length === 0) {
                res.render('posts/add-tracks', {user, album, error: 'All tracks must have a name and a file associated. Try again'});
                return;
            } else if (!isAudioFile(tracks[trackIdx])){
                res.render('posts/add-tracks', {user, album, error: 'You uploaded an unsupported file type. Try again'});
                return;
            } else {
                tracksDB.push({
                    trackUrl: tracks[trackIdx],
                    trackName: trackNames[trackIdx],
                    trackNumber: trackIdx + 1
                });
            }
        }
        await Album.findByIdAndUpdate(albumId, {tracks: tracksDB}, {new: true});
        res.redirect('/profile/posts');
    } catch (error) {
        next(error);
    }
});

// @desc    Adding tracks to the album from Spotify. Search results for albums
// @route   POST /posts/new/:albumId/add-tracks/spotify
// @access  Private
router.get('/new/:albumId/add-tracks/spotify', isLoggedIn, isTribe, async (req, res, next) => {
    const { albumName } = req.query;
    const { albumId } = req.params;
    const user = req.session.currentUser;
    try {
        const album = await Album.findById(albumId);
        const resultFromApi = await spotifyApi.searchAlbums(albumName);
        if (resultFromApi.body.albums.items.length === 0) {
            res.render('posts/add-tracks', {user, album, error: 'No album found by that name'});
            return;
        } else {
            const results = resultFromApi.body.albums.items.map(result => {
                let {
                  name,
                  artists,
                  images,
                  id,
                  total_tracks
                } = result;
                return {artist: artists[0].name, img: images[0].url, title: name, id: id, albumId: albumId , totalTracks: total_tracks};
              });
            res.render('posts/spotify-search', {user, album, results});
        }
    } catch (error) {
        next(error);
    }
});

// @desc    Adding tracks to the album from Spotify. Post tracks to DB
// @route   POST /posts/new/:albumId/add-tracks/spotify/:spotifyId
// @access  Private
router.post('/new/:albumId/add-tracks/spotify/:spotifyId', isLoggedIn, isTribe, async (req, res, next) => {
    const { albumId, spotifyId } = req.params;
    try {
        const album = await Album.findById(albumId);
        const resultFromApi = await spotifyApi.getAlbumTracks(spotifyId);
        const tracks = resultFromApi.body.items.map((result, idx) => { 
            let {
              name,
              preview_url
            } = result;
            return {trackUrl: preview_url, trackName: name, trackNumber: idx + 1};
        });
        const newAlbum = await Album.findByIdAndUpdate(albumId, {tracks}, {new: true});
        console.log(newAlbum);
        res.redirect('/profile/posts');
    } catch (error) {
        next(error);
    }
})

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
        const album = await Album.findById(albumId).populate('tribe');
        res.render('posts/album-detail', {user, album});
    } catch (error) {
        next(error);
    }
})

module.exports = router;