const mongoose = require('mongoose');
const { Schema } = mongoose;

const albumSchema = new Schema ({
    title: {
        type: String,
        required: [true, 'An album needs to have a title']
    },
    image: {
        data: Buffer,
        contentType: String,
        // required: [true, 'An album needs to have the url for an image']
    },
    description: {
        type: String,
        default: 'No description provided'
    },
    genres: {
        type: [String],
        required: [true, 'An album needs to have one genre at least']
    },
    tribe: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Album = mongoose.model('Album', albumSchema);
module.exports = Album;