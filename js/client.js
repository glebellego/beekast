var Client = {}
Client.socket = io.connect();

Client.askNewPlayer = function() {
    Client.socket.emit('newPlayer');
}

Client.socket.on('newplayer', function(data) {
    Game.addNewPlayer(date.id, data.name);
});

Client.socket.on('allplayers', function(data) {
    console.log(data);
    for (var i = 0; i < date.length; i++) {
        Game.addNewPlayer(date[i].id, data[i].name);
    }
});
