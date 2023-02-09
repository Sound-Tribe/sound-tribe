const mongoose = require('mongoose');
const { Schema } = mongoose;

const albumSchema = new Schema ({
    title: {
        type: String,
        required: [true, 'An album needs to have a title']
    },
    image: {
        type: String,
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
    },
    tracks: {
        type: [{
            trackUrl: {
                type: String
            },
            trackName : {
                type: String,
                default: 'No name'
            },
            trackNumber: {
                type: Number,
                min: 1
            }
        }]
    }
}, {
    timestamps: true
});

const Album = mongoose.model('Album', albumSchema);
module.exports = Album;