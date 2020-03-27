var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

server.listen(8080, function () {
    console.log('Listening on ' + server.address().port);
});

server.lastPlayerId = 0;
server.time = 0;
server.score = {};

io.on('connection', function (socket) {
    console.log('Connection detected.');
    // getplayer
    socket.on('getplayer', function () {
        console.log('Asked : getplayer.');
        if (getPlayers().length < 2) {
            console.log('(getplayer)GRANTED');
            socket.player = initPlayer();
            console.log((2 - getPlayers().length) + ' room(s) left.')
            socket.emit('setplayer', socket.player);
            socket.emit('setplayers', getPlayers());
            socket.broadcast.emit('setplayers', getPlayers());
            if (getPlayers().length == 2) {
                // startgame
                setTimeout(function () {
                    console.log('Room full - game starting.');
                    // server.time = getRndInteger(2, 6);
                    server.time = 2;
                    io.sockets.emit('startgame', time);
                    console.log('Game start in: ' + time + ' sec');
                }, 2000)
            }
        } else {
            console.log('(getplayer)DENIED: No room left.');
            socket.emit('noroomleft');
        }
    });
    // getwinner
    socket.on('getwinner', function(data) {
        console.log('Asked : getplayer.');
        server.score[data[0]] = data[1];
        if (Object.keys(server.score).length == 2) {
            // resolve here ...
        } else {
            console.log('(getwinner)DENIED: waiting all scores.');
        }
    });
});

function initPlayer() {
    var result;
    if (getPlayers().length > 0) {
        getPlayers().forEach(function (player) {
            if (player.name != 'PINK') {
                result = {
                    id: server.lastPlayerId++,
                    name: 'PINK'
                }
            } else {
                result = {
                    id: server.lastPlayerId++,
                    name: 'BLUE'
                }
            }
        });
    } else {
        result = {
            id: server.lastPlayerId++,
            name: 'PINK'
        }
    }
    console.log('Init player : ' + result.id + " - " + result.name);
    return result;
}

function getPlayers() {
    var players = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
        var player = io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
    return players;
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resolve(data) {
    var ids
}
