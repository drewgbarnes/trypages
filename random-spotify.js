function getRandomSong(clicked = true) {
    var alphabet = "abcdefghijklmnopqrstuvwxyz";

    function getRandomLetter() {
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    var url_prefix = 'https://open.spotify.com/embed?uri=spotify:track:';
    var spotifyApi = new SpotifyWebApi();
    var random_number = Math.floor((Math.random() * 100000) + 1);
    spotifyApi.searchTracks(getRandomLetter(), {
        limit: 1,
        offset: random_number
    }, function(err, data) {
        if (err) {
            console.error(err);
        } else {
            if (data.tracks.items.length == 0) {
                getRandomSong();
            }
            var url = url_prefix + data.tracks.items[0].id;
            document.getElementById('random-webplayer').src = url;
            if (clicked) {
                document.getElementById('ok').innerHTML = "Anotha one";
            }
        }
    });
}