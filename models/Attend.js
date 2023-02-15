const { Schema, model } = require('mongoose');

const attendSchema = new Schema({
    eventId : {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Attend = model('Attend', attendSchema);
module.exports = Attend;