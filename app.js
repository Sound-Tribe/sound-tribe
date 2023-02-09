require('dotenv').config();
require('./db');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const hbs = require('hbs');
const SpotifyWebApi = require('spotify-web-api-node');

// Routers require
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const postsRouter = require('./routes/posts');
const followRouter = require('./routes/follow');
const likesRouter = require('./routes/likes');

const app = express();

// cookies and loggers
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// For deployment
app.set('trust proxy', 1);
app.use(
  session({
    name: 'sound-tribe',
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 2592000000 // 30 days in milliseconds
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL
    })
  }) 
);

// setting the Spotify API:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token for Spotify API
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('evaluateType', function(object, options) {
  if (object === 'tribe') {
    return '<a href="/posts/new"><img class="nav-icon" src="/images/new-post.png" alt="New post icon link"></a>';
  } 
});

// routes intro
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/posts', postsRouter);
app.use('/follow',followRouter);
app.use('/like', likesRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  if (err.status === 404) {
    res.render('404', { path: req.url });
  } else {
    res.status(err.status || 500);
    res.render('error');
  }
});

module.exports = app;
