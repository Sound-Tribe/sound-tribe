const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const Show = require('../models/Album');
const MONGO_URL = process.env.MONGO_URL;
const shows = require('../data/albums');