var Client = {}
Client.socket = io.connect();

// Call
Client.c_new_player = 'new_player';
Client.c_get_players = 'get_players';
Client.c_resolve_score = 'resolve_score';

Client.callServer = function(name, param) {
    if(param != null) {
        Client.socket.emit(name, param);
    } else {
        Client.socket.emit(name);
    }
}

// Event
Client.e_new_player = 'new_player';
Client.e_players = 'players';
Client.e_start = 'start_game';
Client.e_result = 'result';
Client.e_loose = 'loose';

Client.socket.on(Client.e_new_player, function(data) {
    console.log('New player : ' + data.id + ' - ' + data.name);
    Game.updatePlayer(data);
});

Client.socket.on(Client.e_players, function(data) {
    console.log('Connected players : ' + data.length);
    Game.updatePlayers(data);
});

Client.socket.on(Client.e_start, function(data) {
    console.log('Game starting !');
    Game.start(data);
});

Client.socket.on(Client.e_result, function(data) {
    console.log('Result : ' + data);
    Game.handleResult(data, false);
});

Client.socket.on(Client.e_loose, function(data) {
    console.log('Looser : ' + data);
    Game.handleResult(data, true);
});

// Client.socket.on('deco', function() {
//     console.log('Disconnecion detected - restarting.');
//     Game.handleDisconnction();
// });
