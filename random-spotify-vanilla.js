/*
TODO^:
1>
2>
3>
make this a general playlist building tool
play music in background while searching
select/copy/delete selected?
4>
make functions general
move general functions into shared files for use between different frameworks
random inline TODOs
DRY
remove globalHistory somehow
closures
5>
angular version

^todo order:
>1 syntactically functioning
>2 semantically functioning
>3 user facing
>4 good javascript
>5 future
*/

"use strict";

let globalHistory = [];

const getAccessToken = () => {
    const clientId = "3bdb037d4f41494aaf9104ae6df1fd85";

    const redirectURI = encodeURIComponent(`${window.location.origin}/`);
    window.location.replace(
        `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectURI}&response_type=token`
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

    const access_token = window.location.hash
        .split("&")[0]
        .split("#access_token=")[1];

    if (!access_token) {
        getAccessToken();
    }

    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(access_token);

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
            setSong(track.id);
            addToHistory(
                track.name,
                track.artists[0].name,
                track.album.name,
                track.id
            );
        }
    }

    return function(buttonClicked = true) {
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
    const embed_prefix = "https://open.spotify.com/embed?uri=spotify:track:";
    return function(track_id) {
        document.getElementById("random-webplayer").src =
            embed_prefix + track_id;
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
    let listener_added = false;

    return function() {
        let el = document.getElementById("history-copy-button");
        //setting content in JS is probs a bad idea
        let song_text = " song";
        if (globalHistory.length > 1) {
            song_text += "s";
        }
        el.innerHTML =
            globalHistory.length + song_text + " added to clipboard!";
        el.classList.add("animated", "fadeIn");
        if (!listener_added) {
            listener_added = true;
            el.addEventListener("animationend", animationEnded, false);
        }

        setTimeout(clearAlert, 5000);
    };
})();

const copyToClipboard = (function() {
    const url_prefix = "https://open.spotify.com/track/";

    return function(e) {
        if (globalHistory.length > 0) {
            let text_node = document.getElementById("history-copy-area");
            let s = "";
            for (let i = globalHistory.length - 1; i >= 0; i--) {
                s += url_prefix + globalHistory[i] + "\n";
            }

            text_node.value = s;
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
