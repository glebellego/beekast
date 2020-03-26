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

io.on('connection', function (socket) {
    console.log('Connection detected.');
    socket.on('newplayer', function () {
        console.log('Asked : newplayer.');
        if (getAllPlayers().length < 2) {
            console.log('(newplayer)GRANTED: ' + (2 - getAllPlayers().length) + ' room(s) left.');
            socket.player = initPlayer();
            socket.emit('allplayers', getAllPlayers());
            socket.broadcast.emit('newplayer', socket.player);
        } else {
            console.log('(newplayer)DENIED: No room left.');
            socket.emit('noroomleft');
        }
    });
});

function initPlayer() {
    var result;
    if(getAllPlayers().length > 0) {
        getAllPlayers().forEach(function (player) {
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

function getAllPlayers() {
    var players = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
        var player = io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
    console.log(players)
    return players;
}


