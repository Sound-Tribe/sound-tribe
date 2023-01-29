const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const MONGO_URL = 'mongodb+srv://admin:admin@cluster0.wrqzlmy.mongodb.net/soundTribeDB';
const albums = require('../data/albums');
const Album = require('../models/Album');

mongoose.connect(MONGO_URL)
    .then(response => console.log(`Connected to DB ${response.connection.name}`))
    .then(() => Album.deleteMany())
    .then(() => {
        return Album.create(albums);
    })
    .then(createdAlbums => console.log(`Inserted ${createdAlbums.length} in the DB`))
    .then(() => mongoose.connection.close())
    .catch(err => console.error(err));