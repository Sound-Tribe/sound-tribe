const User = require('../models/User.js');
const Event = require('../models/Event');
const Attend = require('../models/Attend');
const { isLoggedIn, isFan } = require('../middlewares/index.js');
const router = require('./profile.js');

router.get('/:eventId', isLoggedIn, isFan, async (req, res, next) => {
    const user = req.session.currentUser;
    const {eventId} = req.params;
    try {
        const attend = await Attend.findOne({eventId : eventId, userId: user._id});
        if (attend) {
            await Attend.findByIdAndDelete(attend._id);
            res.redirect('back');
        } else {
            await Attend.create({eventId : eventId, userId: user._id});
            res.redirect('back');
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;