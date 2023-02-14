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
const Attend = require('../models/Attend');
const fileUploader = require('../config/cloudinary.config');


// @desc    Profile Page owner. Content = Posts
// @route   GET /profile/posts
// @access  Private
router.get('/posts', isLoggedIn, async (req, res, next) => {
    const userCookie = req.session.currentUser;
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
            const events = JSON.parse(JSON.stringify(await Attend.find({ userId: user._id }).populate('eventId')));
            const calendar = {};
            calendar.events = [];
            events.forEach(event => {
                event.eventId.canAttend = true;
                event.eventId.isAttending = true;
                event.eventId.date = new Date(event.eventId.date).toISOString().substring(0, 10);
                calendar.events.push(event.eventId);
            });
            if (events.length === 0) {
                calendar.empty = true;
            }
            console.log(user);
            res.render('profile/profile', {user, owner:true, calendar});
            return;
        }
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
    const { location, date, ticketsLink } = req.body;
    const jsDate = new Date(date);
    try {
        await Event.create({ tribeId: user._id, date: jsDate, location, ticketsLink });
        res.redirect('/profile/calendar');
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
        const event = JSON.parse(JSON.stringify(await Event.findById(eventId)));
        event.date = new Date(event.date).toISOString().substring(0, 10);
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
    const { location, date, ticketsLink } = req.body;
    const jsDate = new Date(date);
    try {
        await Event.findByIdAndUpdate(eventId, { tribeId: user._id, date: jsDate, location, ticketsLink })
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
router.post('/edit', isLoggedIn, fileUploader.single('picture'), async (req, res, next) => {
    const { username, country, city, spotifyLink, instagramLink } = req.body;
    const picture = req.file.path;
    const user = req.session.currentUser;
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
            res.render('profile/profile', {user, viewer: viewerCookie, isFollowing, posts});
        })
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