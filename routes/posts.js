const router = require('express').Router();
const app = require('../app.js');
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const isLoggedIn = require('../middlewares/index');

// @desc    Get view for new post (album) page
// @route   GET /posts/new
// @access  Private
router.get('new', (req, res ,next) => {
    
})

module.exports = router;