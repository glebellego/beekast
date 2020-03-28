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
server.scores = [];

io.on('connection', function (socket) {
    console.log('Connection detected.');
    // getplayer
    socket.on('getplayer', function () {
        console.log('Received : getplayer.');
        if (getPlayers().length < 2) {
            console.log('(getplayer)GRANTED');
            socket.player = initPlayer();
            console.log((2 - getPlayers().length) + ' room(s) left.')
            socket.emit('setplayer', socket.player);
            io.sockets.emit('setplayers', getPlayers());
            if (getPlayers().length == 2) {
                // startgame
                setTimeout(function () {
                    console.log('Game full - game starting.');
                    server.time = getRndInteger(2, 6);
                    io.sockets.emit('startgame', server.time);
                    console.log('Game start in: ' + server.time + ' sec');
                    server.scores = [];
                }, 2000)
            }
        } else {
            console.log('(getplayer)DENIED: No room left.');
            // socket.emit('noroomleft');
        }
    });
    // getplayers
    socket.on('getplayer', function () {
        console.log('Received : getplayer.');
        socket.emit('setplayers', getPlayers());
        console.log('(getplayers)SUCCESS');
    });
    // sendscore
    socket.on('sendscore', function (data) {
        console.log('Received : sendscore.');
        if (data[1] > 0) {
            server.scores.push({ id: data[0], score: data[1] });
            setTimeout(function () {
                let result;
                if (server.scores.length == 2) {
                    result = resolve();
                    io.sockets.emit('result', result);
                    console.log('(sendscore)SUCCESS : broadcasting result : ' + result);
                } else {
                    result = data[0];
                    io.sockets.emit('result', result);
                    console.log('(sendscore)SUCCESS : broadcasting result : ' + result);
                }
            }, 1000);
        } else {
            let result = data[0];
            io.sockets.emit('loose', result);
            console.log('(sendscore)SUCCESS: broadcasting looser : ' + result);
        }
    });
    // disconnect
    // socket.on('disconnect', function() {
    //     io.sockets.emit('setplayers', getPlayers());
    //     io.sockets.emit('deco');
    // });
});

function disconnectAll() {
    Object.keys(io.sockets.connected).forEach(function (socketID) {
        io.sockets.connected[socketID].close();
    });
}

function initPlayer() {
    var result;
    if (getPlayers().length > 0) {
        getPlayers().forEach(function (player) {
            if (player.name != 'KIRBY') {
                result = {
                    id: server.lastPlayerId++,
                    name: 'KIRBY'
                }
            } else {
                result = {
                    id: server.lastPlayerId++,
                    name: 'KNIGHT'
                }
            }
        });
    } else {
        result = {
            id: server.lastPlayerId++,
            name: 'KIRBY'
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

function resolve() {
    let a = server.scores[0];
    let b = server.scores[1];
    server.scores.forEach(function (i) {
        console.log('id: ' + i.id + ', score: ' + i.score);
    });
    if (a.score == b.score) {       // tie
        return -1;
    } else if (a.score < b.score) { // a win
        return a.id;
    } else {                        // b win
        return b.id;
    }
}
