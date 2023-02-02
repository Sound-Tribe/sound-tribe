const { Schema, model } = require('mongoose');

const followSchema = new Schema({
    followerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    followeeId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Follow = model('Follow', followSchema);
module.exports = Follow;