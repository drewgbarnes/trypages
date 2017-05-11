/*
TODO^:
1>
2>
3>
delete all button
there may be duplicates in the history?
insertBefore not insertAfter
4>
make functions general
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

function replaySong(replayButton) {
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

// el.addEventListener("animationend", animationEnded, false);
// function animationEnded(e) {
//     e.target.classList.remove('animated', 'fadeIn');
// }

function clearAlert() {
    let el = document.getElementById('tracklist-button');
    el.classList.remove('animated', 'fadeIn');
    el.innerHTML = 'Copy history to clipboard';
    el.classList.add('animated', 'fadeIn');
}

function alertCopied() {
    let el = document.getElementById('tracklist-button');
    el.classList.remove('animated', 'fadeIn');
    //setting content in JS is probs a bad idea
    let song_text = ' song';
    if (globalHistory.length > 1) {
        song_text += 's';
    }
    el.innerHTML = globalHistory.length + song_text + ' added to clipboard!';
    el.classList.add('animated', 'fadeIn');

    setTimeout(clearAlert, 5000);
}

function copyToClipboard(e) {
    var text_node = document.querySelector('#tracklist');
    //find easier way to do this
    var url_prefix = 'https://open.spotify.com/track/';
    var s = '';
    for (var i = globalHistory.length - 1; i >= 0; i--) {
        s += url_prefix + globalHistory[i] + '\n';
    }
    text_node.value = s;
    doCopy(e, alertCopied);
}

function doCopy(e, callback) {
    var
        t = e.target,
        c = t.dataset.copytarget,
        inp = (c ? document.querySelector(c) : null);

    if (inp && inp.select) {
        inp.select();
        try {
            document.execCommand('copy');
            inp.blur();
            callback();
        } catch (err) {
            alert('Please press Ctrl/Cmd+C to copy');
        }
    }
}
