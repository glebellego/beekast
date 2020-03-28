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
    console.log('Connection detected');

    // new_player
    socket.on('new_player', function () {
        console.log('Received : new_player');
        if (getPlayers().length < 2) {
            socket.player = initPlayer();
            socket.emit('new_player', socket.player);
            console.log('(new_player) SUCCESS : ' +
                socket.player.id + ' - ' + socket.player.name);

            io.sockets.emit('players', getPlayers());
            console.log('(new_player) ' + (2 - getPlayers().length) + ' room(s) left.')

            if (getPlayers().length == 2) {
                // start_game
                setTimeout(function () {
                    console.log('Game full - game starting.');

                    server.time = getRndInteger(2, 6);
                    io.sockets.emit('start_game', server.time);
                    console.log('Game start in: ' + server.time + ' sec');

                    server.scores = [];
                }, 2000)
            }
        } else {
            console.log('(new_player) DENIED: No room left.');
            // socket.emit('noroomleft');
        }
    });

    // get_players
    socket.on('get_players', function () {
        console.log('Received : get_players');
        socket.emit('players', getPlayers());
        console.log('(get_players) SUCCESS');
    });

    // resolve_score
    socket.on('resolve_score', function (data) {
        console.log('Received : resolve_score');
        if (data[1] > 0) {
            server.scores.push({ id: data[0], score: data[1] });
            setTimeout(function () {
                let result;
                if (server.scores.length == 2) {
                    result = resolve();
                    io.sockets.emit('result', result);
                    console.log('(resolve_score) SUCCESS : broadcasting result : ' + result);
                } else {
                    result = data[0];
                    io.sockets.emit('result', result);
                    console.log('(resolve_score) SUCCESS : broadcasting result : ' + result);
                }
            }, 1000);
        } else {
            let result = data[0];
            io.sockets.emit('loose', result);
            console.log('(resolve_score) SUCCESS: broadcasting looser : ' + result);
        }
    });

    // disconnect
    // socket.on('disconnect', function() {
    //     io.sockets.emit('setplayers', getPlayers());
    //     io.sockets.emit('deco');
    // });
});

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

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPlayers() {
    var players = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
        var player = io.sockets.connected[socketID].player;
        if (player) players.push(player);
    });
    return players;
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
