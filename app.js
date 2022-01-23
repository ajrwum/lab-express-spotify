require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting urlencoded to be able to read the req.body
app.use(express.urlencoded({ extended: false }));



// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:

// - home (search form)
app.get('/', (req, res, next) => {
  console.log('*** ROUTE / ***');
  res.render('index');
});

// - search artists
app.get('/artist-search', (req, res, next) => {
  console.log('*** ROUTE /artist-search ***');
  // getting the user's input
  const artistName = req.query.artist;
  // searching the api for the input artist
  spotifyApi
  .searchArtists(artistName)
  .then(data => {
    // console.log('The received data from the API: ', data.body);
    const artists = data.body.artists.items;
    res.render('artist-search-results', { artists });
  })
  .catch(err => console.log('The error while searching artists occurred: ', err));
});

// - search albums for an artist
app.get('/albums/:artistId', (req, res, next) => {
  console.log('*** ROUTE /albums/:artistId ***');
  // getting the artist's albums from api
  spotifyApi.getArtistAlbums(req.params.artistId)
  .then(function(data) {
    // console.log('The received data from the API: ', data.body);
    const albums = data.body.items;
    res.render('albums', { albums });
  }, function(err) {
    console.error(err);
  });
});

// - search tracks for an album
app.get('/albums/:albumId/tracks', (req, res, next) => {
  console.log('*** ROUTE /albums/:albumId/tracks ***');
  // getting the album's tracks from api
  spotifyApi.getAlbumTracks(req.params.albumId/* , { limit : 5, offset : 1 } */)
  .then(function(data) {
    const tracks = data.body.items;
    res.render('tracks', { tracks });
  }, function(err) {
    console.log('Something went wrong!', err);
  });
});


app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
