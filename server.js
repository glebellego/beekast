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
    socket.on('newplayer', function () {
        console.log('connection ...');
        if (getAllPlayers.length < 2) {
            socket.player = initPlayer();
            console.log("emit allplayer.");
            socket.emit('allplayers', getAllPlayers());
            console.log("broadcast newplayer.");
            socket.broadcast.emit('newplayer', socket.player);
        } else {
            console.log('No room left for new player.');
            socket.emit('noroomleft');
        }
    });
});

function initPlayer() {
    console.log('Start init player.')
    var players = getAllPlayers();
    var result;
    players.forEach(function (player) {
        if (player.name !== 'PINK') {
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
    console.log('Init : ' + result.id + ' - ' + result.name + '.');
    return result;
}

function getAllPlayers() {
    var players = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
        var player = io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
    return players;
}


