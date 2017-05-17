/*
TODO^:
1>
2>
3>
4>
redo copy logic for vuejs
5>

^todo order:
>1 syntactically functioning
>2 semantically functioning
>3 user facing
>4 good javascript
>5 future
*/

'use strict';

let app = new Vue({
    el: '#app',
    created: function() {
        let everythingLoaded = setInterval(function() {
            if (/loaded|complete/.test(document.readyState)) {
                clearInterval(everythingLoaded);
                app.getRandomSong(false);
            }
        }, 10);
    },
    data: { globalHistory: [] },
    methods: {

        getRandomSong: function(clicked = true) {
            function getRandomLetter() {
                let alphabet = "abcdefghijklmnopqrstuvwxyz";
                return alphabet[Math.floor(Math.random() * alphabet.length)];
            }

            function getRandomNumber() {
                return Math.floor((Math.random() * 100000) + 1);
            }

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
                        app.getRandomSong();
                        return;
                    }
                    let track = data.tracks.items[0];
                    app.setSong(track.id);
                    app.addToHistory(track.name, track.artists[0].name, track.album.name, track.id);
                    if (clicked) {
                        //TODO: this is done every time, only need to do it 1x
                        app.$refs.getSong.innerHTML = "Anotha one";
                    }
                }
            });
        },

        setSong: function(track_id) {
            let embed_prefix = 'https://open.spotify.com/embed?uri=spotify:track:';
            app.$refs.randomWebplayer.src = embed_prefix + track_id;
        },

        removeFromHistory: function(id) {
            for (var i = app.globalHistory.length - 1; i >= 0; i--) {
                if (app.globalHistory[i].id == id) {
                    app.globalHistory.splice(i, 1);
                    return;
                }
            }
        },

        removeAllFromHistory: function() {
            app.globalHistory = [];
        },

        addToHistory: function(track, artist, album, id) {
            app.globalHistory.unshift({ id: id, song: track, artist: artist, album: album });
        },

        copyToClipboard: function(e) {
            let url_prefix = 'https://open.spotify.com/track/';

            if (app.globalHistory.length > 0) {
                let text_node = app.$refs.historyCopyArea;
                let s = '';
                for (let i = app.globalHistory.length - 1; i >= 0; i--) {
                    s += url_prefix + app.globalHistory[i].id + '\n';
                }

                text_node.value = s;
                app.doCopy(e, app.alertCopied);
            }
        },

        doCopy: function(e, callback) {
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
        },

        alertCopied: function() {
            let listener_added = false;

            let el = app.$refs.historyCopyButton;
            //setting content in JS is probs a bad idea
            let song_text = ' song';
            if (app.globalHistory.length > 1) {
                song_text += 's';
            }
            el.innerHTML = app.globalHistory.length + song_text + ' added to clipboard!';
            el.classList.add('animated', 'fadeIn');
            if (!listener_added) {
                listener_added = true;
                el.addEventListener("animationend", app.animationEnded, false);
            }

            setTimeout(app.clearAlert, 5000);
        },

        clearAlert: function() {
            let el = app.$refs.historyCopyButton;
            //setting content in JS is probs a bad idea
            el.innerHTML = 'Copy history to clipboard';
            el.classList.add('animated', 'fadeIn');
        },

        animationEnded: function(e) {
            e.target.classList.remove('animated', 'fadeIn');
        },
    }
})
