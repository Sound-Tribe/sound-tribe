const router = require('express').Router();
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const Follow = require('../models/Follow');
const shuffle = require('../utils/shuffle');
const {isLoggedIn} = require('../middlewares/index');
const computeLikes = require('../utils/computeLikes.js');


// @desc    Redirects to /discover if not logged in. Redirects to /home if logged in
// @route   GET /
// @access  Public
router.get('/', (req, res, next) => {
  if (req.session.currentUser) {
    res.redirect('/home');
  } else {
    res.render('landing');
  }
});

// @desc    Displays most recent posts by your followees.
// @route   GET /home
// @access  Private
router.get('/home', isLoggedIn, async (req, res, next) => {
  const user = req.session.currentUser;
  try {
    const follows = await Follow.find({ followerId: user._id })
    const albumPromises = [];
    follows.forEach(follow => {
      albumPromises.push(new Promise((resolve, reject) => {
        resolve(Album.find({ tribe: follow.followeeId }).sort({"_id": -1}).limit(10).populate('tribe'));
      }));
    });
    Promise.all(albumPromises).then(albumsResolvedPromises => {
      const albumsPreLikes = [];
      albumsResolvedPromises.forEach(followee => {
        followee.forEach(album => {
          albumsPreLikes.push(JSON.parse(JSON.stringify(album)));
        });
      });
      const albumLikesPromises = [];
      albumsPreLikes.forEach(album => {
        albumLikesPromises.push(new Promise((resolve, reject) => {
          resolve(computeLikes(album, user));
        }));
      });
      Promise.all(albumLikesPromises).then(albums => {
        if (albums.length === 0) {
          res.render('home', {user, empty: 'No follows'});
          return;
        } else {
          res.render('home', {user, albums});
        }
      }).catch(error => {
        next(error);
      });
    })
    .catch(error => {
      next(error);
    });
  } catch (error) {
    next(error);
  } 
});

// @desc    Discover page. Latest content if not logged in. Addapted to interests if logged in. 
//          Contains search user form
// @route   GET /discover
// @access  Public & Private
router.get('/discover', async (req, res, next) => {
  if (!req.session.currentUser) {
    // Not logged in gets latest content from all genres
    try {
      const latestAlbums = await Album.find().sort({"_id": -1}).limit(10);
      res.render('discover', {latestAlbums});
    } catch (error) {
      next(error);
    }
  } else {
    // Logged in gets latest content from interests genres shuffled
    const user = req.session.currentUser;
    const { interests } = await User.findById(req.session.currentUser._id);
    let latestAlbumsAll = [];
    for (let interest of interests) {
      let albums = await Album.find({
        genres: {
          $in: [interest]
        }
      }).sort({ createdAt: -1 }).limit(10).populate('tribe');
      albums.forEach(album => latestAlbumsAll.push(album));
    }
    // Removes duplicates & Own Albums
    const ids = [];
    let latestAlbumsPreLikes = latestAlbumsAll.filter(album => {
      if (!ids.includes(album._id.toString()) && album.tribe._id.toString() != user._id.toString()) {
        ids.push(album._id.toString());
        return true;
      }
    });
    latestAlbumsPreLikes = shuffle(latestAlbumsPreLikes);
    likePromises = [];
    latestAlbumsPreLikes.forEach(album => {
      likePromises.push(new Promise((resolve, reject) => {
        resolve(computeLikes(album, user));
      }));
    });
    Promise.all(likePromises).then((latestAlbums) => {
      if (latestAlbums.length === 0) {
        res.render('discover', {user, empty: 'No interests defined'});
        return;
      } else {
        res.render('discover', {user, latestAlbums});
      }
    })
  }
});

// @desc    Searches for a user in the DB 
// @route   POST /discover
// @access  Private
router.post('/discover/search', isLoggedIn, async (req, res, next) => {
  const user = req.session.currentUser;
  const { userQuery } = req.body;
  try {
    // Filters out your username
    const searchResults = (await User.find({ username: userQuery.toLowerCase() })).filter(userDB => userDB._id.toString() != user._id.toString());
    
    if (searchResults.length === 0) {
      res.render('discover', {user, emptySearch: 'Not found'});
    } else {
      res.render('discover', {user, searchResults});
    }
  } catch (error) {
    next(error);
  }
})
module.exports = router;
