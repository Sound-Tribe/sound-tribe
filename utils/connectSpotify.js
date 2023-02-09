const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

// setting the Spotify API:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
  });
  
  // Retrieve an access token for Spotify API
  spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

    module.exports = spotifyApi;