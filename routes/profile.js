const router = require('express').Router();
const Album = require('../models/Album.js');
const User = require('../models/User.js');
const Follow = require('../models/Follow');
const Like = require('../models/Like');
const Event = require('../models/Event');
const Attend = require('../models/Attend');
const {isLoggedIn, isTribe} = require('../middlewares/index');
const interestsDB = require('../utils/interests');
const computeFollows = require('../utils/computeFollows');
const computeLikes = require('../utils/computeLikes');
const computeEventOwner = require('../utils/computeEventOwner.js');
const fileUploader = require('../config/cloudinary.config');
const cloudinary = require('cloudinary');

// @desc    Profile Page owner. Content = Posts
// @route   GET /profile/posts
// @access  Private
router.get('/posts', isLoggedIn, async (req, res, next) => {
    const userCookie = req.session.currentUser;
    const scrollPosition = parseInt(req.query.scroll) || 0;
    if(userCookie.type === 'fan') {
        res.redirect('/profile/liked');
        return;
    }
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
        const posts = await Promise.all(postPromises);
        if (posts.length === 0) {
            res.render('profile/profile', {user, owner: true, emptyPosts: 'No posts yet'});
            return;
        } else {
            res.render('profile/profile', {user, owner: true, posts, scrollPosition: scrollPosition});
            return;
        }
    } catch (error) {
        next(error);
    }
});

// @desc    Profile Page owner. Content = Liked
// @route   GET /profile/liked
// @access  Private
router.get('/liked', isLoggedIn, async (req, res, next) => {
    const userCookie = req.session.currentUser;
    const scrollPosition = parseInt(req.query.scroll) || 0;
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
        const liked = await Promise.all(likedPromises);
        if (liked.length === 0) {
            res.render('profile/profile', {user, owner: true, emptyLiked: 'Emplty liked page'});
            return;
        } else {
            res.render('profile/profile', {user, owner: true, liked: liked, scrollPosition: scrollPosition});
            return;
        }
    } catch (error) {
        next(error);
    }
});

// @desc    Profile Page owner. Content = Calendar
// @route   GET /profile/calendar
// @access  Private
router.get('/calendar', isLoggedIn, async (req, res, next) => {
    const userCookie = req.session.currentUser;
    try {
        const user = await computeFollows(userCookie);
        if (user.type === 'tribe') {
            user.isTribe = true;
            const eventsDB = await Event.find({tribeId: user._id});
            const events = JSON.parse(JSON.stringify(eventsDB));
            events.forEach(event => {
                event.isOwner = true;
                event.date = new Date(event.date).toISOString().substring(0, 10);
            });
            const calendar = {};
            if (events.length === 0) {
                calendar.empty = true;
            }
            calendar.events = events;
            res.render('profile/profile', {user, owner:true, calendar});
            return;
        } else {
            const eventsPreOwner = JSON.parse(JSON.stringify(await Attend.find({ userId: user._id }).populate('eventId')));
            const eventOwnerPromises = [];
            eventsPreOwner.forEach(event => {
                eventOwnerPromises.push(new Promise((resolve, reject) => {
                    resolve(computeEventOwner(event));
                }));
            });
            const events = await Promise.all(eventOwnerPromises);
            const calendar = {};
            calendar.events = [];
            events.forEach(event => {
                event.eventId.canAttend = true;
                event.eventId.isAttending = true;
                event.eventId.date = new Date(event.eventId.date).toISOString().substring(0, 10);
                event.eventId.tribe = event.tribe;
                calendar.events.push(event.eventId);
            });
            if (events.length === 0) {
                calendar.empty = true;
            }
            res.render('profile/profile', {user, owner:true, calendar});
            return;
        }
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
router.post('/edit', isLoggedIn, fileUploader.single('picture'), async (req, res, next) => {
    const user = req.session.currentUser;
    const { username, country, city, spotifyLink, instagramLink } = req.body;
    if(req.file) {
        picture = req.file.path;
    } else {
        picture = cloudinary.url(user.picture)
    }
    const regexURL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/;
    if (spotifyLink && !regexURL.test(spotifyLink)) {
        res.render('profile/edit-profile', {user, error: 'Enter a valid URL for spotify link'});
        return;
    }
    if (instagramLink && !regexURL.test(instagramLink)) {
        res.render('profile/edit-profile', {user, error: 'Enter a valid URL for instagram link'});
        return;
    }
    try {
        const newUser = await User.findByIdAndUpdate(user._id, { username, picture, country, city, spotifyLink, instagramLink }, { new: true });
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
    const scrollPosition = parseInt(req.query.scroll) || 0;
    try {
        const userDB = await User.findById(userId);
        if (userDB.type === 'fan') {
            res.redirect(`/profile/view/${userId}/calendar`);
            return;
        }
        const userPreFollowCompute = JSON.parse(JSON.stringify(userDB));
        const user = await computeFollows(userPreFollowCompute);
        const isFollowing = await Follow.findOne({ followerId: viewerCookie._id, followeeId: userId });
        const postsDB = await Album.find({ tribe: userId });
        const postsPrePromise = JSON.parse(JSON.stringify(postsDB));
        const postPromises = [];
        postsPrePromise.forEach(post => {
            postPromises.push(new Promise((resolve, rej) => {
                resolve(computeLikes(post, viewerCookie));
            }));
        });
        const posts = await Promise.all(postPromises);
        if (posts.length === 0) {
            res.render('profile/profile', {user, viewer: viewerCookie, isFollowing, emptyPosts: 'No posts to see'});
            return;
        } else {
            res.render('profile/profile', {user, viewer: viewerCookie, isFollowing, posts, scrollPosition: scrollPosition});
            return;
        }
    } catch (error) {
        next(error);
    }
});

// @desc    View other's profile. content = calendar
// @route   GET /profile/view/:userId/calendar
// @access  Private
router.get('/view/:userId/calendar', isLoggedIn, async (req, res, next) => {
    const { userId } = req.params;
    const viewerCookie = req.session.currentUser;
    try {
        const events = JSON.parse(JSON.stringify(await Event.find({tribeId: userId})));
        const attendingEvents = await Attend.find({userId: viewerCookie._id});
        const attendingEventsIds = attendingEvents.map(event => event.eventId.toString());
        events.forEach(event => {
            event.date = new Date(event.date).toISOString().substring(0, 10);
            if (viewerCookie.type === 'fan') {
                event.canAttend = true;
            }
            if (attendingEventsIds.includes(event._id.toString())) {
                event.isAttending = true;
            } else {
                event.isAttending = false;
            }
        });
        const calendar = {};
        if (events.length === 0) {
            calendar.empty = true;
        }
        calendar.events = events;
        const userDB = await User.findById(userId);
        const userPreFollows = JSON.parse(JSON.stringify(userDB));
        const user = await computeFollows(userPreFollows);
        const isFollowing = await Follow.findOne({ followerId: viewerCookie._id, followeeId: userId });
        res.render('profile/profile', {user, viewer: viewerCookie, calendar, isFollowing});
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

// @desc    Delete profile and all its posts
// @route   GET /profile/delete-profile
// @access  Private
router.get('/delete-profile', isLoggedIn, async (req, res, next) => {
    const userId = req.session.currentUser._id;
    try {
        const albums = await Album.find({ tribe: userId });
        const deleteLikesPromises = [];
        albums.forEach(album => {
            deleteLikesPromises.push(new Promise((resolve, reject) => {
                resolve(Like.deleteMany({ albumId: album._id }));
            }));
        });
        const events = await Event.find({ tribeId: userId });
        const deleteAttendPromises = [];
        events.forEach(event => {
            deleteAttendPromises.push(new Promise((resolve, reject) => {
                resolve(Attend.deleteMany({ eventId: event._id }));
            }));
        })
        await Promise.all(deleteLikesPromises);
        await Promise.all(deleteAttendPromises)
        await Album.deleteMany({ tribe: userId });
        await Follow.deleteMany({ followeeId: userId });
        await Follow.deleteMany({ followerId: userId });
        await Like.deleteMany({ likeUserId: userId });
        await Event.deleteMany({ tribeId: userId });
        await Attend.deleteMany({ userId: userId });
        await User.findByIdAndDelete(userId);
        req.session.destroy((err) => {
            if (err) {
              next(err);
            } else {
              res.redirect("/");
            }
          });
    } catch (error) {
        next(error);
    }
})

module.exports = router;