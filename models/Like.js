const { Schema, model } = require('mongoose');

const likeSchema = new Schema({
    albumId: {
        type: Schema.Types.ObjectId,
        ref: 'Album'
    },
    likeUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Like = model('Like', likeSchema);
module.exports = Like;