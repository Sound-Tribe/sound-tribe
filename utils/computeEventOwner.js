const User = require('../models/User');

module.exports = async (event) => {
    const tribe = await User.findById(event.eventId.tribeId);
     event.tribe = tribe.username;
    return event;
}