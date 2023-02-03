const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL;
const albumsPre = require('../data/albums');
const Album = require('../models/Album');
const User = require('../models/User');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const bcrypt = require("bcrypt");
const saltRounds = 10;

const users = [
    {
        username: 'gerard',
        email: 'gerard@gmail.com',
        hashedPassword: 'Pas1234',
        type: 'tribe'
    },
    {
        username: 'marcbs',
        email: 'marcbs@gmail.com',
        hashedPassword: 'Pas1234',
        type: 'tribe'
    },
    {
        username: 'fan1',
        email: 'fan1@gmail.com',
        hashedPassword: 'Pas1234',
        type: 'fan'
    },
    {
        username: 'fan2',
        email: 'fan2@gmail.com',
        hashedPassword: 'Pas1234',
        type: 'fan'
    },
    {
        username: 'fan3',
        email: 'fan3@gmail.com',
        hashedPassword: 'Pas1234',
        type: 'fan'
    }
];

const hashedUsers = users.map(async (user) => {
    const hashedPassword = await bcrypt.hash(user.hashedPassword, saltRounds);
    return { ...user, hashedPassword };
  });

Promise.all(hashedUsers).then(users => {
    mongoose.connect(MONGO_URL)
    .then(response => console.log(`Connected to DB ${response.connection.name}`))
    .then(() => Album.deleteMany())
    .then(() => User.deleteMany())
    .then(() => Like.deleteMany())
    .then(() => Follow.deleteMany())
    .then(() => {
        return User.create(users);
    })
    .then((createdUsers) => {
        console.log(`Inserted ${createdUsers.length} users in the DB`);
        const tribeIds = [createdUsers[0]._id.toString(), createdUsers[1]._id.toString()];
        const albums = albumsPre.map(album => {
            album.tribe = tribeIds[Math.floor(Math.random()*2)];
            return album;
        });
        return Album.create(albums);
    })
    .then(createdAlbums => console.log(`Inserted ${createdAlbums.length} albums in the DB`))
    .then(() => mongoose.connection.close())
    .catch(err => console.error(err)); 
});
