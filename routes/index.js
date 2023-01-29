const router = require('express').Router();
const Album = require('../models/Album.js');
const User = require('../models/User.js');

// @desc    App home page. Redirects to /discover if not logged in. Redirects to /home if logged in
// @route   GET /
// @access  Public
router.get('/', (req, res, next) => {
  if (req.session.currentUser) {
    res.redirect('/home');
  } else {
    res.redirect('/discover');
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
    const { interests } = await User.findById(req.session.currentUser._id)
    

  }
})
module.exports = router;
