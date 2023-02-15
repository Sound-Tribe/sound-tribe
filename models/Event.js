const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
    tribeId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        required: [true, 'A date is required']

    },
    location: {
        type: String,
        required: [true, 'A location is required']
    },
    ticketsLink : {
        type: String
    }
});

const Event = model('Event', eventSchema);
module.exports = Event;