const { Schema, model } = require('mongoose');

const eventSchme = new Schema({
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
    }
})