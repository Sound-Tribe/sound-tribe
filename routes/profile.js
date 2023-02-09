const router = require('express').Router();
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const Follow = require('../models/Follow');
const {isLoggedIn, isTribe} = require('../middlewares/index');
const interestsDB = require('../utils/interests');
const computeFollows = require('../utils/computeFollows');
const Like = require('../models/Like');
const computeLikes = require('../utils/computeLikes');
const Event = require('../models/Event');


// @desc    Profile Page owner. Content = Posts
// @route   GET /profile/posts
// @access  Private
router.get('/posts', isLoggedIn, async (req, res, next) => {
    const userCookie = req.session.currentUser;
    try {
        const user = await computeFollows(userCookie);
        // Retreives all posts from DB
        const postsDB = await Album.find({ tribe: userCookie._id});
        const postsPrePromise = JSON.parse(JSON.stringify(postsDB));
        const postPromises = [];
        postsPrePromise.forEach(post => {
            post.owner = true;
            postPromises.push(new Promise((resolve, rej) => {
                resolve(computeLikes(post, userCookie));
            }));
        });
        Promise.all(postPromises).then((postsResolvedPromises) => {
            const posts = postsResolvedPromises;
            if (posts.length === 0) {
                res.render('profile/profile', {user, owner: true, emptyPosts: 'No posts yet'});
                return;
            } else {
                res.render('profile/profile', {user, owner: true, posts});
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Profile Page owner. Content = Liked
// @route   GET /profile/liked
// @access  Private
router.get('/liked', isLoggedIn, async (req, res, next) => {
    const userCookie = req.session.currentUser;
    try {
        const user = await computeFollows(userCookie);
        // Retreives all liked posts from user & populates the album 
        const likedDB = await Like.find({ likeUserId: user._id }).populate('albumId');
        const likedPrePromise = JSON.parse(JSON.stringify(likedDB));
        const likedPromises = [];
        likedPrePromise.forEach(like => {
            likedPromises.push(new Promise((resolve, reject) => {
                resolve(computeLikes(like.albumId, user));
            }))
        });
        Promise.all(likedPromises).then((likedResolvedPromises) => {
            const liked = likedResolvedPromises;
            if (liked.length === 0) {
                res.render('profile/profile', {user, owner: true, emptyLiked: 'Emplty liked page'});
                return;
            } else {
                res.render('profile/profile', {user, owner: true, liked: liked});
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Profile Page owner. Content = Calendar
// @route   GET /profile/calendar
// @access  Private
router.get('/calendar', isLoggedIn, isTribe, async (req, res, next) => {
    const userCookie = req.session.currentUser;
    try {
        const user = await computeFollows(userCookie);
        const eventsDB = await Event.find({tribeId: user._id});
        const events = JSON.parse(JSON.stringify(eventsDB));
        events.forEach(event => {
            event.isOwner = true;
        });
        const calendar = {};
        if (events.length === 0) {
            calendar.empty = true;
        }
        calendar.events = events;
        res.render('profile/profile', {user, owner:true, calendar});
    } catch (error) {
        next(error);
    }
});

// @desc    Create new event view
// @route   GET /profile/calendar/new
// @access  Private
router.get('/calendar/new', isLoggedIn, isTribe, (req, res, next) => {
    const user = req.session.currentUser;
    res.render('events/new-event', {user});
});

// @desc    Create new event post
// @route   POST /profile/calendar/new
// @access  Private
router.post('/calendar/new', isLoggedIn, isTribe, async (req, res, next) => {
    const user = req.session.currentUser;
    const {day, month, year, location } = req.body;
    try {
        await Event.create({ tribeId: user._id, day, month, year, location });
        res.redirect('/profile/posts');
    } catch (error) {
        next(error);
    }
});

// @desc    Edit event view
// @route   GET /profile/calendar/edit/:eventId
// @access  Private
router.get('/calendar/edit/:eventId', isLoggedIn, isTribe, async (req, res, next) => {
    const user = req.session.currentUser;
    const {eventId} = req.params;
    try {
        const event = await Event.findById(eventId);
        res.render('events/edit-event', {user, event});
    } catch (error) {
        next(error);
    }
});

// @desc    Edit event post
// @route   POST /profile/calendar/edit/:eventId
// @access  Private
router.post('/calendar/edit/:eventId', isLoggedIn, isTribe, async (req, res, next) => {
    const user = req.session.currentUser;
    const {eventId} = req.params;
    const {day, month, year, location } = req.body;
    try {
        await Event.findByIdAndUpdate(eventId, { tribeId: user._id, day, month, year, location })
        res.redirect('/profile/calendar');
    } catch (error) {
        next(error);
    }
});

// @desc    Delete event
// @route   GET /profile/calendar/delete/:eventId
// @access  Private
router.get('/calendar/delete/:eventId', isLoggedIn, isTribe, async (req, res, next) => {
    const {eventId} = req.params;
    try {
        await Event.findByIdAndDelete(eventId);
        res.redirect('/profile/calendar');
    } catch (error) {
        next(error);
    }
});

// @desc    Profile Edit Page.
// @route   GET /profile/edit
// @access  Private
router.get('/edit', isLoggedIn, (req, res, next) => {
    const user = req.session.currentUser;
    if (user.type === 'tribe') {
        user.isTribe = true;
    }
    res.render('profile/edit-profile', { user })
});

// @desc    Profile Edit Page
// @route   POST /profile/edit
// @access  Private
router.post('/edit', isLoggedIn, async (req, res, next) => {
    const { username, picture, country, city, spotifyLink, instagramLink } = req.body;
    const user = req.session.currentUser;
    const regexURL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/;
    let updatedInfo = {};
    if(username) {
        updatedInfo.username = username;
    }  
    if (picture) {
        if (regexURL.test(picture)) {
            updatedInfo.picture = picture;
        } else {
            res.render('profile/edit-profile', {user, error: 'Enter a valid URL for picture'});
            return;
        }
      }
    if (country) {
        updatedInfo.country = country;
    }
    if (city) {
        updatedInfo.city = city;
    }
    if (spotifyLink) {
        if (regexURL.test(spotifyLink)) {
            updatedInfo.spotifyLink = spotifyLink;
        } else {
            res.render('profile/edit-profile', {user, error: 'Enter a valid URL for spotify link'});
            return;
        }
      }
      if (instagramLink) {
        if (regexURL.test(instagramLink)) {
            updatedInfo.instagramLink = instagramLink;
        } else {
            res.render('profile/edit-profile', {user, error: 'Enter a valid URL for instagram link'});
            return;
        }
      }
    const userId = user._id;
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
    let { genres } = req.body;
    let wrongGenres = [];
    if (typeof genres === 'string') {
        if (!interestsDB.includes(genres)) {
            wrongGenres.push(genres);
        }
    } else if (typeof genres === 'undefined') {
        genres = [];
    } else {
        wrongGenres = genres.filter(genre => !interestsDB.includes(genre));
    }
    if (wrongGenres.length === 0) {
        try {
            const updatedUser = await User.findByIdAndUpdate(user._id, {interests: genres}, { new: true });
            req.session.currentUser = updatedUser;
            res.redirect('/profile/posts');
        } catch (error) {
            next(error);
        }
    } else {
        const { interests } = await User.findById(user._id);
        const notCheckedInterests = interestsDB.filter((item) => !interests.includes(item));
        res.render('profile/edit-interests', {user, interests, notCheckedInterests, error: 'Something went wrong. Try again'});
    }
});

// @desc    View other's profile. content = posts
// @route   GET /profile/view/:userId/posts
// @access  Private
router.get('/view/:userId/posts', isLoggedIn, async (req, res, next) => {
    const { userId } = req.params;
    const viewerCookie = req.session.currentUser;
    try {
        const userDB = await User.findById(userId);
        const userPreFollowCompute = JSON.parse(JSON.stringify(userDB));
        const user = await computeFollows(userPreFollowCompute);
        // isFollowing = null if not following
        const isFollowing = await Follow.findOne({ followerId: viewerCookie._id, followeeId: userId });
        const postsDB = await Album.find({ tribe: userId });
        const postsPrePromise = JSON.parse(JSON.stringify(postsDB));
        const postPromises = [];
        postsPrePromise.forEach(post => {
            postPromises.push(new Promise((resolve, rej) => {
                resolve(computeLikes(post, viewerCookie));
            }));
        });
        Promise.all(postPromises).then(postsResolvedPromises => {
            const posts = postsResolvedPromises;
            if (isFollowing) {
                res.render('profile/profile', {user, isFollowing, posts});
            } else {
                res.render('profile/profile', {user, posts});
            }
        })
    } catch (error) {
        next(error);
    }
});

// @desc    View followers of certain profile
// @route   GET /profile/:userId/followers
// @access  Private
router.get('/:userId/followers', isLoggedIn, async (req, res, next) => {
    const {userId} = req.params;
    try {
        const user = await User.findById(userId);
        const followers = await Follow.find({ followeeId: userId }).populate('followerId');
        if (followers.length === 0) {
            res.render('profile/followers', {user, empty: 'No followers'});
            return;
        } else {
            res.render('profile/followers', {user, followers});
        }
    } catch (error) {
        next(error);
    }
});

// @desc    View followings of certain profile
// @route   GET /profile/:userId/following
// @access  Private
router.get('/:userId/following', isLoggedIn, async (req, res, next) => {
    const {userId} = req.params;
    try {
        const user = await User.findById(userId);
        const followings = await Follow.find({ followerId: userId }).populate('followeeId');
        if (followings.length === 0) {
            res.render('profile/following', {user, empty: 'No followings'});
            return;
        } else {
            res.render('profile/following', {user, followings});
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;