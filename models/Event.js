const { Schema, model } = require('mongoose');

const eventSchma = new Schema({
    tribeId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    day: {
        type: Number,
        min: 1,
        max: 31
    },
    month: {
        type: Number,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        min: 2023
    },
    location: String
});

const Event = model('Event', eventSchma);
module.exports = Event;