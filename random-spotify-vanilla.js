/*
TODO:
1>
2>
3>
make this a general playlist building tool?
    JTBD:
        I want to find new music.
            I want to only find similar music to what I listen to.
            I want to find music somewhat different from what I listen to, but not too different.
            I want to find totally different music from what I am used to.
            I want to find music based my friends' music choices/recs.

read spotify's API EULA
    actually integrate w/ spotify
        add to the user's playlist
        add to new playlist
        add to queue
        search based on user's prefs
            https://github.com/JMPerez/spotify-web-api-js#personalization
            as long as it isnt "dynamic"
            https://developer.spotify.com/legal/commercial-restrictions/
        etc
        find random public playlists?
            not sure if possible?
        random within genre
            other filters too: artist, song length, vibe (spotify has a keywork for this)

    share button(s)
    play music in background while searching
    select/copy/delete selected?
    preserve playlists between sessions/manage offline
4>
minify everything
save relevant documentation for offline work
    spotify api (their webpages?)
    https://github.com/JMPerez/spotify-web-api-js
    bootstrap
    javascript/html/css/window functions...
    react
    vue
make functions abstract
move abstract functions into shared files for use between different frameworks
    not sure if this is possible
random inline TODOs
DRY
remove globalHistory somehow
closures
5>
angular version?

^todo order:
>1 syntactically functioning
>2 semantically functioning
>3 user facing
>4 good javascript
>5 future
*/

"use strict";

let globalHistory = [];
let offline = false;

// TODO: should I add an event listener instead? is that what this is?
window.onoffline = () => {
    offline = true;
};

window.ononline = () => {
    offline = false;
};

const getAccessToken = () => {
    const SPOTIFY_CLIENT_ID = "3bdb037d4f41494aaf9104ae6df1fd85";
    const redirectURI = encodeURIComponent(
        `${window.location.origin}${window.location.pathname}`
    );
    window.location.replace(
        `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${redirectURI}&response_type=token`
    );
};

const getRandomSong = (function() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    function getRandomLetter() {
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function getRandomNumberLessThan(lessThan) {
        return Math.floor(Math.random() * lessThan);
    }

    const accessToken = window.location.hash
        .split("&")[0]
        .split("#access_token=")[1];

    if (!accessToken && !offline) {
        getAccessToken();
    }

    // TODO: show error and button to refresh if no access token
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);

    function searchCallback(err, data) {
        if (err) {
            // TODO: show an error to the user
            console.error(err);
        } else {
            //search will not return tracks if offset > query result
            if (data.tracks.items.length == 0) {
                getRandomSong();
                return;
            }
            let track = data.tracks.items[0];
            addToHistory(
                track.name,
                track.artists[0].name,
                track.album.name,
                track.id
            );
            setSong(track.id);
        }
    }

    return function(buttonClicked = true) {
        // TODO: pool of songs is only 26*10000.
        spotifyApi.searchTracks(
            getRandomLetter(),
            {
                limit: 1,
                offset: getRandomNumberLessThan(10000)
            },
            searchCallback
        );

        if (
            buttonClicked &&
            document.getElementById("get-song").innerHTML !== "Anotha one!"
        ) {
            document.getElementById("get-song").innerHTML = "Anotha one!";
        }
    };
})();

const setSong = (function() {
    const embedPrefix = "https://open.spotify.com/embed?uri=spotify:track:";
    return function(trackId) {
        document.getElementById("random-webplayer").src = embedPrefix + trackId;
    };
})();

function removeFromHistory(deleteButton) {
    // this is generally bad if the HTML changes
    deleteButton.parentElement.parentElement.remove();
    globalHistory.splice(
        globalHistory.indexOf(deleteButton.dataset.spotifyId),
        1
    );
}

function removeAllFromHistory() {
    let node = document.getElementById("history");
    for (let i = node.children.length - 1; i >= 0; i--) {
        if (node.children[i].id != "history-clone") {
            node.children[i].remove();
        }
    }
    globalHistory = [];
}

function addToHistory(track, artist, album, id) {
    let node = document.getElementById("history-clone");
    let copy = node.cloneNode(true);

    globalHistory.push(id);

    copy.style.display = "table-row";
    copy.removeAttribute("id");

    //this is generally bad if the HTML changes
    copy.children.namedItem("song").innerHTML = track;
    copy.children.namedItem("artist").innerHTML = artist;
    copy.children.namedItem("album").innerHTML = album;
    copy.children
        .namedItem("replay")
        .children.namedItem("replay-button").dataset.spotifyId = id;
    copy.children
        .namedItem("delete")
        .children.namedItem("delete-button").dataset.spotifyId = id;
    node.parentNode.insertBefore(copy, node.nextSibling);
}

function animationEnded(e) {
    e.target.classList.remove("animated", "fadeIn");
}

function clearAlert() {
    let el = document.getElementById("history-copy-button");
    //setting content in JS is probs a bad idea
    el.innerHTML = "Copy history to clipboard";
    el.classList.add("animated", "fadeIn");
}

const alertCopied = (function() {
    let listenerAdded = false;

    return function() {
        let el = document.getElementById("history-copy-button");
        //setting content in JS is probs a bad idea
        let songText = " song";
        if (globalHistory.length > 1) {
            songText += "s";
        }
        el.innerHTML = globalHistory.length + songText + " added to clipboard!";
        el.classList.add("animated", "fadeIn");
        if (!listenerAdded) {
            listenerAdded = true;
            el.addEventListener("animationend", animationEnded, false);
        }

        setTimeout(clearAlert, 5000);
    };
})();

const copyToClipboard = (function() {
    const urlPrefix = "https://open.spotify.com/track/";

    return function(e) {
        if (globalHistory.length > 0) {
            let textNode = document.getElementById("history-copy-area");
            let s = "";
            for (let i = globalHistory.length - 1; i >= 0; i--) {
                s += urlPrefix + globalHistory[i] + "\n";
            }

            textNode.value = s;
            doCopy(e, alertCopied);
        }
    };
})();

function doCopy(e, callback) {
    let t = e.target,
        c = t.dataset.copytarget,
        inp = c ? document.querySelector(c) : null;

    if (inp && inp.select) {
        inp.select();
        try {
            document.execCommand("copy");
            inp.blur();
            callback();
        } catch (err) {
            alert("Please press Ctrl/Cmd+C to copy");
        }
    }
}

let everythingLoaded = setInterval(function() {
    if (/loaded|complete/.test(document.readyState)) {
        clearInterval(everythingLoaded);
        getRandomSong(false);
    }
}, 10);
