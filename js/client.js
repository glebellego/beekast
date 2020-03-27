var Client = {}
Client.socket = io.connect();

Client.getPlayer = function() {
    Client.socket.emit('getplayer');
}

Client.getPlayers = function() {
    Client.socket.emit('getplayers');
}

Client.startGame = function() {
    Client.socket.emit('startgame');
}

Client.getWinner = function(id, score) {
    Client.socket.emit('getwinner', [id, score]);
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
