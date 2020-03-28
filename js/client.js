var Client = {}
Client.socket = io.connect();

Client.restart = function() {
    location.reload();
}

Client.getPlayer = function() {
    Client.socket.emit('getplayer');
}

Client.getPlayers = function() {
    Client.socket.emit('getplayers');
}

Client.startGame = function() {
    Client.socket.emit('startgame');
}

Client.sendScore = function(id, score) {
    Client.socket.emit('sendscore', [id, score]);
};

Client.socket.on('setplayer', function(data) {
    console.log('New player : ' + data.id + ' - ' + data.name);
    Game.updatePlayer(data);
});

Client.socket.on('setplayers', function(data) {
    console.log('Connected players : ' + data.length);
    Game.updatePlayers(data);
});

Client.socket.on('startgame', function(data) {
    console.log('Game starting !');
    Game.startGame(data);
});

Client.socket.on('result', function(data) {
    console.log('Result : ' + data);
    Game.setResult(data, false);
});

Client.socket.on('loose', function(data) {
    console.log('Looser : ' + data);
    Game.setResult(data, true);
});

// Client.socket.on('deco', function() {
//     console.log('Disconnecion detected - restarting.');
//     Game.handleDisconnction();
// });
