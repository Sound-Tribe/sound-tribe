const router = require('express').Router();
const Album = require('../models/Album.js');
const User = require('../models/User.js');

// This function will be used to shuffle the results in discovery
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// @desc    App home page. Redirects to /discover if not logged in. Redirects to /home if logged in
// @route   GET /
// @access  Public
router.get('/', (req, res, next) => {
  if (req.session.currentUser) {
    res.redirect('/home');
  } else {
    res.render('landing');
  }
});

// @desc    Discover page. Latest content if not logged in. Addapted to interests if logged in
// @route   GET /discover
// @access  Public & Private
router.get('/discover', async (req, res, next) => {
  // Not logged in gets latest content from all genres
  if (!req.session.currentUser) {
    try {
      const latestAlbums = await Album.find().sort({"_id": -1}).limit(10);
      res.render('discover', {latestAlbums});
    } catch (error) {
      next(error);
    }
  } else {
    const { interests } = await User.findById(req.session.currentUser._id);
    let latestAlbums = [];
    for (let interest of interests) {
      let albums = await Album.find({
        genres: {
          $in: [interest]
        }
      }).sort({ createdAt: -1 }).limit(10);
      albums.forEach(album => latestAlbums.push(album));
    }
    latestAlbums = shuffle(latestAlbums);
    if (latestAlbums.length === 0) {
      res.render('discover', { error: 'No albums to show'});
    } else {
      res.render('discover', {latestAlbums});
    }
  }
})
module.exports = router;
