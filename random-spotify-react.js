/*
TODO^:
1>
2>
3>
version css padding messed up
4>
5>

^todo order:
>1 syntactically functioning
>2 semantically functioning
>3 user facing
>4 good javascript
>5 future
*/

'use strict';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.spotifyApi = new SpotifyWebApi();
        this.state = { trackId: '', clicked: false, tracks: [] };
        this.getSong = this.getSong.bind(this);
        this.getAndSetTracks = this.getAndSetTracks.bind(this);
        this.playSong = this.playSong.bind(this);
        this.removeFromHistory = this.removeFromHistory.bind(this);
        this.removeAllFromHistory = this.removeAllFromHistory.bind(this);
    }

    componentDidMount() {
        this.getSong();
    }

    getRandomLetter() {
        let alphabet = "abcdefghijklmnopqrstuvwxyz";
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    getRandomNumber() {
        return Math.floor((Math.random() * 100000) + 1);
    }

    getSong(event) {
        if (event && !this.state.clicked) {
            this.setClicked(true);
        }

        this.spotifyApi.searchTracks(this.getRandomLetter(), {
            limit: 1,
            offset: this.getRandomNumber()
        }).then(this.getAndSetTracks, (err) => {
            console.error(err);
        });
    }

    playSong(event) {
        this.setState({ trackId: event.currentTarget.value });
    }

    removeAllFromHistory() {
        this.setState({ tracks: [] });
    }

    removeFromHistory(event) {
        let id = event.currentTarget.value;

        this.setState(function(prevState) {
            let t = prevState.tracks;
            for (var i = t.length - 1; i >= 0; i--) {
                if (t[i].id == id) {
                    t.splice(i, 1);
                    break;
                }
            }
            return {
                tracks: t
            }
        });
    }

    getAndSetTracks(data) {
        if (data.tracks.items.length == 0) {
            this.getSong();
            return;
        }
        let track = data.tracks.items[0];
        this.setTracks(track);
    }

    setTracks(track) {
        this.setState(function(prevState) {
            let t = prevState.tracks;
            t.unshift({
                id: track.id,
                artist: track.artists[0].name,
                song: track.name,
                album: track.album.name
            });
            return {
                tracks: t,
                trackId: track.id
            }
        });
    }

    setClicked(clicked) {
        this.setState({ clicked: clicked });
    }

    render() {
        const tracks = this.state.tracks;
        return (
            <div className="container spotify-green">
                <Header getSong={this.getSong} clicked={this.state.clicked}/>
                <hr/>
                <Body 
                    trackId={this.state.trackId} 
                    tracks={tracks} 
                    playSong={this.playSong} 
                    removeFromHistory={this.removeFromHistory}
                    removeAllFromHistory={this.removeAllFromHistory}
                    />
                <p className="text-center">After songs are copied to your clipboard: go to the Spotify desktop app, open a playlist, and paste (Ctrl/Cmd+V or Edit Menu -> paste)</p>
            </div>
        )
    }
}

function Header(props) {
    return (
        <div className="row top-pad">
            <GetButton getSong={props.getSong} clicked={props.clicked}/>
            <VersionButtons />
        </div>
    );
}

function GetButton(props) {
    let text = props.clicked ? "Anotha One" : "Get a random song from Spotify!";
    return (
        <div className="col-md-6 col-md-offset-3 text-center">
            <button className="btn btn-primary btn-lg" onClick={props.getSong}>
                {text}
            </button>
        </div>
    );
}

function VersionButtons(props) {
    return (
        <div className="col-md-3">
            <a className="btn btn-default btn-xs" href="index.html">Vanilla JS</a>
            <a className="btn btn-default btn-xs" href="vue.html">Vue JS</a>
            <a className="btn btn-primary btn-xs" href="react.html">React JS</a>
        </div>
    );
}

function Body(props) {
    return (
        <div className="row">
            <SpotifyFrame src={props.trackId}/>
            <History 
                tracks={props.tracks} 
                playSong={props.playSong} 
                removeFromHistory={props.removeFromHistory}
                removeAllFromHistory={props.removeAllFromHistory}
                />
        </div>
    );
}

class SpotifyFrame extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const embed_prefix = 'https://open.spotify.com/embed?uri=spotify:track:';
        let src = this.props.src ? embed_prefix + this.props.src : '';
        return (
            <div className="col-md-4">
                <iframe src={src} width="300" height="380" frameBorder="0" allowTransparency="true"></iframe>
            </div>
        );
    }
}

class History extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="col-md-8">
                <div className="well">
                    <h2 className="inline">History</h2>
                    <HistoryCopy tracks={this.props.tracks} />
                    <HistoryTable 
                        tracks={this.props.tracks} 
                        playSong={this.props.playSong} 
                        removeFromHistory={this.props.removeFromHistory}
                        removeAllFromHistory={this.props.removeAllFromHistory}
                    />
                </div>
            </div>
        );
    }
}

class HistoryCopy extends React.Component {
    constructor(props) {
        super(props);
        this.doCopy = this.doCopy.bind(this);
    }

    listToNewlineString() {
        const url_prefix = 'https://open.spotify.com/track/';
        let s = '';
        if (this.props.tracks.length > 0) {
            for (let i = this.props.tracks.length - 1; i >= 0; i--) {
                s += url_prefix + this.props.tracks[i].id + '\n';
            }
        }
        return s;
    }

    doCopy(e) {
        let
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

    render() {
        return (
            <div className="inline pull-right">
                <textarea id="historyCopyArea" className="offscreen" type="text" value={this.listToNewlineString(this.props.tracks)}></textarea>
                <CopyButton total={this.props.tracks.length} doCopy={this.doCopy}/>
            </div>
        );
    }
}

class CopyButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = { copy: false };
        this.clearAlert = this.clearAlert.bind(this);
        this.alertCopied = this.alertCopied.bind(this);
    }

    clearAlert() {
        this.setState({ copy: false });
    }

    alertCopied(e) {
        if (this.props.total > 0) {
            this.setState({ copy: true });
            this.props.doCopy(e);
        }
    }

    render() {
        const copy = this.state.copy;
        const total = this.props.total;
        let button_text = 'Copy history to clipboard';
        if (copy && total > 0) {
            button_text = total > 1 ? ' songs' : ' song';
            button_text = total + button_text + ' added to clipboard!';
            setTimeout(this.clearAlert, 5000);
        }

        // el.classList.add('animated', 'fadeIn');
        // el.addEventListener("animationend", app.animationEnded, false);
        // el.classList.remove('animated', 'fadeIn');

        return (
            <button 
                onClick={this.alertCopied} 
                data-copytarget="#historyCopyArea" 
                className={"btn btn-primary pull-right" + (copy ? ' animated fadeIn':'')}>
                {button_text}
            </button>
        );
    }
}

class HistoryTable extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="table-responsive">
                <table className="table">
                        <HistoryTableHeader removeAllFromHistory={this.props.removeAllFromHistory}/>
                        <HistoryTableBody 
                            tracks={this.props.tracks} 
                            playSong={this.props.playSong} 
                            removeFromHistory={this.props.removeFromHistory}
                            />
                </table>
            </div>
        );
    }
}

class HistoryTableHeader extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <thead>
                <tr>
                    <th>Song</th>
                    <th>Artist</th>
                    <th>Album</th>
                    <th></th>
                    <th>
                        <button onClick={this.props.removeAllFromHistory} className="btn btn-danger btn-xs" title="Remove all songs from history">
                            <span className="glyphicon glyphicon-minus"></span>
                        </button>
                    </th>
                </tr>
            </thead>
        );
    }
}

class HistoryTableBody extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const tracks = this.props.tracks;
        const rows = tracks.map((track) =>
            <HistoryTableRow 
                key={track.id}
                id={track.id}
                song={track.song}
                artist={track.artist}
                album={track.album}
                playSong={this.props.playSong}
                removeFromHistory={this.props.removeFromHistory}
                />
        );
        return (
            <tbody>
                {rows}
            </tbody>
        );
    }
}

function HistoryTableRow(props) {
    return (
        <tr>
            <td>{props.song}</td>
            <td>{props.artist}</td>
            <td>{props.album}</td>
            <td>
                <button value={props.id} onClick={props.playSong} className="btn btn-success btn-xs" title="Play this song">
                    <span className="glyphicon glyphicon-play"></span>
                </button>
            </td>
            <td>
                <button value={props.id} onClick={props.removeFromHistory} className="btn btn-danger btn-xs" title="Remove this song from history">
                    <span className="glyphicon glyphicon-minus"></span>
                </button>
            </td>
        </tr>
    );
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);
