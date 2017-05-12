/*
TODO^:
1>
2>
3>
select all/delete selected?
4>
make functions general
random inline TODOs
closures
DRY
5>
vuejs version
angular version
react version

^todo order:
>1 syntactically functioning
>2 semantically functioning
>3 user facing
>4 good javascript
>5 future
*/


'use strict';

var globalHistory = [];

function getRandomSong(clicked = true) {
    //TODO: only create 1 instance w/ closure?
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    function getRandomLetter() {
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function getRandomNumber() {
        return Math.floor((Math.random() * 100000) + 1);
    }

    //TODO: only create 1 instance w/ closure?
    let spotifyApi = new SpotifyWebApi();
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
                return;
            }
            let track = data.tracks.items[0];
            setSong(track.id);
            addToHistory(track.name, track.artists[0].name, track.album.name, track.id);
            if (clicked) {
                //TODO: this is done every time, only need to do it 1x
                document.getElementById('get-song').innerHTML = "Anotha one";
            }
        }
    });
}

//maybe we can just call setSong from the html
function replaySong(replayButton) {
    setSong(replayButton.dataset.spotifyId);
}

function setSong(track_id) {
    const embed_prefix = 'https://open.spotify.com/embed?uri=spotify:track:';
    document.getElementById('random-webplayer').src = embed_prefix + track_id;
}

function removeFromHistory(deleteButton) {
    //this is generally bad if the HTML changes
    deleteButton.parentElement.parentElement.remove();
    globalHistory.splice(globalHistory.indexOf(deleteButton.dataset.spotifyId), 1);
}

function removeAllFromHistory() {
    let node = document.getElementById('history');
    for (let i = node.children.length - 1; i >= 0; i--) {
        if (node.children[i].id != 'history-clone') {
            node.children[i].remove();
        }
    }
}

function addToHistory(track, artist, album, id) {
    let node = document.getElementById('history-clone');
    let copy = node.cloneNode(true);

    globalHistory.push(id);

    copy.style.display = "table-row";
    copy.removeAttribute('id');

    //this is generally bad if the HTML changes
    copy.children.namedItem('song').innerHTML = track;
    copy.children.namedItem('artist').innerHTML = artist;
    copy.children.namedItem('album').innerHTML = album;
    copy.children.namedItem('replay').children.namedItem('replay-button').dataset.spotifyId = id;
    copy.children.namedItem('delete').children.namedItem('delete-button').dataset.spotifyId = id;
    node.parentNode.insertBefore(copy, node.nextSibling);
}

function animationEnded(e) {
    e.target.classList.remove('animated', 'fadeIn');
}

function clearAlert() {
    let el = document.getElementById('history-copy-button');
    //setting content in JS is probs a bad idea
    el.innerHTML = 'Copy history to clipboard';
    el.classList.add('animated', 'fadeIn');
    el.addEventListener("animationend", animationEnded, false);
}

function alertCopied() {
    let el = document.getElementById('history-copy-button');
    //setting content in JS is probs a bad idea
    let song_text = ' song';
    if (globalHistory.length > 1) {
        song_text += 's';
    }
    el.innerHTML = globalHistory.length + song_text + ' added to clipboard!';
    el.classList.add('animated', 'fadeIn');
    el.addEventListener("animationend", animationEnded, false);

    setTimeout(clearAlert, 5000);
}

function copyToClipboard(e) {
    let text_node = document.getElementById('history-copy-area');
    //find easier way to do string concat
    const url_prefix = 'https://open.spotify.com/track/';
    let s = '';
    for (let i = globalHistory.length - 1; i >= 0; i--) {
        s += url_prefix + globalHistory[i] + '\n';
    }
    text_node.value = s;
    doCopy(e, alertCopied);
}

function doCopy(e, callback) {
    let
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
