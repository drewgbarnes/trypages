function getRandomSong(clicked = true) {
    var alphabet = "abcdefghijklmnopqrstuvwxyz";

    function getRandomLetter() {
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

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
            var track = data.tracks.items[0];
            setSong(track.id);
            if (clicked) {
                document.getElementById('ok').innerHTML = "Anotha one";
            }
            addToHistory(track.name, track.artists[0].name, track.album.name, track.id);
        }
    });
}

function setSong(track_id) {
    var url_prefix = 'https://open.spotify.com/embed?uri=spotify:track:';
    document.getElementById('random-webplayer').src = url_prefix + track_id;
}

function removeFromHistory(guy){
    guy.parentElement.parentElement.remove();
}

function addToHistory(track, artist, album, id) {
    var node = document.querySelector('#history-clone');
    copy = node.cloneNode(true);
    copy.style.display = "table-row";
    copy.removeAttribute('id');
    copy.children.namedItem('song').innerHTML = track;
    copy.children.namedItem('artist').innerHTML = artist;
    copy.children.namedItem('album').innerHTML = album;
    copy.children.namedItem('replay').children.namedItem('replay-button').id = id;
    node.parentNode.insertBefore(copy, node);
}
