/*
TODO^:
1>
2>
show instructions for what to do when songs are copied
"Go to the Spotify desktop app and paste (Ctrl/Cmd+V or Edit Menu -> paste)"
show copy success
3>
delete all button
there may be duplicates in the history?
insertBefore not insertAfter
4>
random inline TODOs
closures
DRY

^todo order:
>1 syntactically functioning
>2 semantically functioning
>3 user facing
>4 good javascript
*/


'use strict';

var globalHistory = [];

function getRandomSong(clicked = true) {
    //TODO: only create 1 instance w/ closure?
    var alphabet = "abcdefghijklmnopqrstuvwxyz";

    function getRandomLetter() {
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function getRandomNumber() {
        return Math.floor((Math.random() * 100000) + 1);
    }

    //TODO: only create 1 instance w/ closure?
    var spotifyApi = new SpotifyWebApi();
    spotifyApi.searchTracks(getRandomLetter(), {
        limit: 1,
        offset: getRandomNumber()
    }, function(err, data) {
        if (err) {
            console.error(err);
        } else {
            //search will not return tracks if offset > query result
            if (data.tracks.items.length == 0) {
                getRandomSong();
            }
            var track = data.tracks.items[0];
            setSong(track.id);
            addToHistory(track.name, track.artists[0].name, track.album.name, track.id);
            if (clicked) {
                //TODO: this is done every time, only need to do it 1x
                document.getElementById('ok').innerHTML = "Anotha one";
            }
        }
    });
}

function replaySong(replayButton){
    setSong(replayButton.dataset.spotifyId);
}

function setSong(track_id) {
    var embed_prefix = 'https://open.spotify.com/embed?uri=spotify:track:';
    document.getElementById('random-webplayer').src = embed_prefix + track_id;
}

function removeFromHistory(deleteButton) {
    //this is generally bad if the HTML changes
    deleteButton.parentElement.parentElement.remove();
    globalHistory.splice(globalHistory.indexOf(deleteButton.dataset.spotifyId), 1);
}

function addToHistory(track, artist, album, id) {
    var node = document.querySelector('#history-clone');
    var copy = node.cloneNode(true);

    globalHistory.push(id);
    
    copy.style.display = "table-row";
    copy.removeAttribute('id');

    //this is generally bad if the HTML changes
    copy.children.namedItem('song').innerHTML = track;
    copy.children.namedItem('artist').innerHTML = artist;
    copy.children.namedItem('album').innerHTML = album;
    copy.children.namedItem('replay').children.namedItem('replay-button').dataset.spotifyId = id;
    copy.children.namedItem('delete').children.namedItem('delete-button').dataset.spotifyId = id;
    node.parentNode.insertBefore(copy, node);
}

function copyToClipboard(e){
    var text_node = document.querySelector('#tracklist');
    //find easier way to do this
    var url_prefix = 'https://open.spotify.com/track/';
    var s = '';
    for (var i = globalHistory.length - 1; i >= 0; i--) {
        s += url_prefix + globalHistory[i] + '\n';
    }
    text_node.value = s;
    doCopy(e);
}

function doCopy(e) {
    var
        t = e.target,
        c = t.dataset.copytarget,
        inp = (c ? document.querySelector(c) : null);

    if (inp && inp.select) {
        inp.select();
        try {
            document.execCommand('copy');
            inp.blur();
        } catch (err) {
            alert('Please press Ctrl/Cmd+C to copy');
        }
    }
}
