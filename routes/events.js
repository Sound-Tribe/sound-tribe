const router = require('express').Router();
const {isLoggedIn, isTribe} = require('../middlewares/index');
const Event = require('../models/Event');
const Attend = require('../models/Attend');


// @desc    Create new event view
// @route   GET /events/new
// @access  Private
router.get('/new', isLoggedIn, isTribe, (req, res, next) => {
    const user = req.session.currentUser;
    res.render('events/new-event', {user});
});

// @desc    Create new event post
// @route   POST /events/new
// @access  Private
router.post('/new', isLoggedIn, isTribe, async (req, res, next) => {
    const user = req.session.currentUser;
    const { location, date, ticketsLink } = req.body;
    const jsDate = new Date(date);
    const regexURL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/;
    if (ticketsLink && !regexURL.test(ticketsLink)) {
        res.render('events/new-event', {user, error:"Please enter a valid link"});
        return;
    }
    if (!date || !location) {
        res.render('events/new-event', {user, error:"Please input required fields"});
        return;
    }
    try {
        await Event.create({ tribeId: user._id, date: jsDate, location, ticketsLink });
        res.redirect('/profile/calendar');
    } catch (error) {
        next(error);
    }
});

// @desc    Edit event view
// @route   GET /events/edit/:eventId
// @access  Private
router.get('/edit/:eventId', isLoggedIn, isTribe, async (req, res, next) => {
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
// @route   POST /events/edit/:eventId
// @access  Private
router.post('/edit/:eventId', isLoggedIn, isTribe, async (req, res, next) => {
    const user = req.session.currentUser;
    const {eventId} = req.params;
    const { location, date, ticketsLink } = req.body;
    const jsDate = new Date(date);
    const regexURL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/;
    if (!date || !location) {
        res.redirect(`/profile/calendar/edit/${eventId}`);
        return;
    }
    try {
        if (ticketsLink && !regexURL.test(ticketsLink)) {
            const event = JSON.parse(JSON.stringify(await Event.findById(eventId)));
            event.date = new Date(event.date).toISOString().substring(0, 10);
            res.render('events/edit-event', {user, event, error: 'Enter a valid URL'}); 
            return;
        }
        await Event.findByIdAndUpdate(eventId, { tribeId: user._id, date: jsDate, location, ticketsLink })
        res.redirect('/profile/calendar');
    } catch (error) {
        next(error);
    }
});

// @desc    Delete event
// @route   GET /events/delete/:eventId
// @access  Private
router.get('/delete/:eventId', isLoggedIn, isTribe, async (req, res, next) => {
    const {eventId} = req.params;
    try {
        await Attend.deleteMany({eventId: eventId});
        await Event.findByIdAndDelete(eventId);
        res.redirect('/profile/calendar');
    } catch (error) {
        next(error);
    }
});

module.exports = router;