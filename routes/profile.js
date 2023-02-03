const router = require('express').Router();
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const Follow = require('../models/Follow');
const isLoggedIn = require('../middlewares/index');
const interestsDB = require('../utils/interests');
const computeFollows = require('../utils/computeFollows');
const Like = require('../models/Like');
const computeLikes = require('../utils/computeLikes');


// @desc    Profile Page. Content = Posts
// @route   GET /profile/posts
// @access  Private
router.get('/posts', isLoggedIn, async (req, res, next) => {
    const userCookie = req.session.currentUser;
    try {
        const postsDB = await Album.find({ tribe: userCookie._id});
        const postsPrePromise = JSON.parse(JSON.stringify(postsDB));
        const user = await computeFollows(userCookie);
        const postPromises = [];
        postsPrePromise.forEach(post => {
            post.owner = true;
            postPromises.push(new Promise((resolve, rej) => {
                resolve(computeLikes(post, userCookie));
            }))
        });
        Promise.all(postPromises).then((postsResolvedPromises) => {
            const posts = postsResolvedPromises;
            res.render('profile/profile', {user, owner: true, posts});

        });
    } catch (error) {
        next(error);
    }
});

// @desc    Profile Page. Content = Liked
// @route   GET /profile/liked
// @access  Private
router.get('/liked', isLoggedIn, async (req, res, next) => {
    const user = req.session.currentUser;
    try {
        const liked = await Like.find({ likeUserId: user._id })
        // Should retreive all liked posts from user
        // For testing purposes
        const content =[{
            title: 'album1Liked',
            description: 'something'
        },{
            title: 'album2Liked',
            description: 'somethingasdf'
        }];
        console.log(liked)
        // Remember to add owner property like in /profile/posts
        // Remeber to computeFollows
        res.render('profile/profile', {user, owner: true, liked: liked});
    } catch (error) {
        next(error);
    }
});

// @desc    Profile Page. Content = Calendar
// @route   GET /profile/calendar
// @access  Private
router.get('/calendar', isLoggedIn, async (req, res, next) => {
    const userId = req.session.currentUser._id;
    try {
        const user = await User.findById(userId);
        // Should retreive all calendar events from user
        // For testing purposes
        const content =[{
            date: 'Wednesday 1st',
            location: 'Barcelona'
        },{
            date: 'Thursday 2nd',
            location: 'Valencia'
        }];
        // Remember to add owner property like in /profile/posts
        // Remeber to computeFollows
        res.render('profile/profile', {user, owner:true, calendar: content});
    } catch (error) {
        next(error);
    }
})

// @desc    Profile Edit Page.
// @route   GET /profile/edit
// @access  Private
router.get('/edit', isLoggedIn, async (req, res, next) => {
    const userId = req.session.currentUser._id;
    try {
        const user = await User.findById(userId);
        res.render('profile/edit-profile', { user, owner: true })
    } catch (error) {
        next (error);
    }
});

// @desc    Profile Edit Page
// @route   POST /profile/edit
// @access  Private
router.post('/edit', isLoggedIn, async (req, res, next) => {
    const { username, picture, country, city, socialMedia } = req.body;
    let updatedInfo = {};
  if(username) {
    updatedInfo.username = username;
  }  
  if (picture) {
    updatedInfo.picture = picture;
  }
  if (country) {
    updatedInfo.country = country;
  }
  if (city) {
    updatedInfo.city = city;
  }
  if (socialMedia) {
    updatedInfo.socialMedia = socialMedia;
  }
  const userId = req.session.currentUser._id;
  try {
    const newUser = await User.findByIdAndUpdate(userId, updatedInfo, { new: true });
    req.session.currentUser = newUser;
    res.redirect('/profile/edit/interests');
  } catch (error) {
    next(error);
  }
});

// @desc    Profile Edit Interests
// @route   GET /profile/edit/interests
// @access  Private
router.get('/edit/interests', isLoggedIn, async (req, res, next) => {
    const user = req.session.currentUser;
    try {
        const { interests } = await User.findById(user._id);
        const notCheckedInterests = interestsDB.filter((item) => !interests.includes(item));
        res.render('profile/edit-interests', {user, interests, notCheckedInterests});
    } catch (error) {
        next(error);
    }
});

// @desc    Profile Edit Interests
// @route   POST /profile/edit/interests
// @access  Private
router.post('/edit/interests', isLoggedIn, async (req, res, next) => {
    const user = req.session.currentUser;
    const { genres } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(user._id, {interests: genres}, { new: true });
        req.session.currentUser = updatedUser;
        res.redirect('/profile/posts');
    } catch (error) {
        next(error);
    }
});

// @desc    View other's profile. content = posts
// @route   GET /profile/view/:userId/posts
// @access  Private
router.get('/view/:userId/posts', isLoggedIn, async (req, res, next) => {
    const { userId } = req.params;
    const viewerId = req.session.currentUser._id;
    try {
        const userDB = await User.findById(userId);
        const userPreFollowCompute = JSON.parse(JSON.stringify(userDB));
        const user = await computeFollows(userPreFollowCompute);
        console.log(user);
        const posts = await Album.find({ tribe: userId });
        const isFollowing = await Follow.findOne({ followerId: viewerId, followeeId: userId });
        // isFollowing = null if not following
        if (isFollowing) {
            res.render('profile/profile', {user, isFollowing, posts});
        } else {
            res.render('profile/profile', {user, posts});
        }
    } catch (error) {
        next(error);
    }
});

// @desc    View other's profile. content = liked
// @route   GET /profile/view/:userId/liked
// @access  Private
router.get('view/:userId/liked', isLoggedIn, async (req, res, next) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        // Should retreive all liked posts from user
        // For testing purposes
        const content =[{
            title: 'album1Liked',
            description: 'something'
        },{
            title: 'album2Liked',
            description: 'somethingasdf'
        }];
        // Remeber to computeFollows
        res.render('profile/profile', {user, liked: content});
    } catch (error) {
        next(error);
    }
})


module.exports = router;