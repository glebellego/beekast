const status_sleep = 'SLEEP';
const status_connect = 'CONNECT';
const status_connected = 'CONNECTED';
const status_wait = 'WAIT';
const status_start = 'START';
const status_engage = 'ENGAGE';
const status_resolve = 'RESOLVE';
const status_result = 'RESULT';
const status_loose = 'LOOSE';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: document.getElementById('game'),
    physics: {
        default: 'arcade'
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var Game = {};
var t_engage, t_resolve;

var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

function preload() {
    this.load.image('sky', 'assets/space.png');
    this.load.image('tie', 'assets/tie.png');
    this.load.image('excl_mark', 'assets/excl_mark.png');

    this.load.image('p_stand', 'assets/p_stand.png');
    this.load.image('p_atk', 'assets/p_atk.png');
    this.load.image('p_fall', 'assets/p_fall.png');

    this.load.image('b_stand', 'assets/b_stand.png');
    this.load.image('b_atk', 'assets/b_atk.png');
    this.load.image('b_fall', 'assets/b_fall.png');
}

function create() {
    Game.players = {};
    Game.player = {};
    Game.status = status_sleep;

    this.add.image(400, 300, 'sky');
    tie = this.add.image(400, 466, 'tie');
    excl_mark = this.add.image(400, 300, 'excl_mark');

    p_stand = this.add.image(200, 450, 'p_stand');
    p_loose = this.add.image(200, 450, 'p_fall');
    p_atk = this.add.image(650, 450, 'p_atk');
    p_fall = this.add.image(650, 450, 'p_fall');

    b_stand = this.add.image(600, 442, 'b_stand');
    b_loose = this.add.image(600, 442, 'b_fall');
    b_atk = this.add.image(150, 442, 'b_atk');
    b_fall = this.add.image(150, 442, 'b_fall');

    clearAllSprites()

    text1 = this.add.text(0, 0, 'text 1 here', style);
    text2 = this.add.text(0, 0, 'text 2 here', style);
    text1.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    text2.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    Phaser.Display.Align.In.Center(text1, this.add.zone(300, 150, 800, 200));
    Phaser.Display.Align.In.Center(text2, this.add.zone(300, 200, 800, 200));

    this.input.keyboard.on('keydown', handleEvent, this);
    this.input.on('pointerdown', handleEvent);
}

function update() {
    switch (Game.status) {
        case status_sleep:
            text1.setText('Touch or press any key to start !');
            text2.setText('');
            break;

        case status_connect:
            text1.setText('Connecting ...');
            text2.setText('');
            break;

        case status_connected:
            text1.setText('Connected !');
            text2.setText('Playing as ' + Game.player.name);

            Game.status = status_wait;
            break;

        case status_wait:
            text1.setText('Waiting for player ...');

            displaySprites()
            break;

        case status_start:
            text1.setText('Game Starting');
            text2.setText('Stand ready !');

            displaySprites()

            this.time.delayedCall((2000), clearTexts, [], this);
            this.time.delayedCall((Game.time * 1000), engage, [], this);
            break;

        case status_resolve:
            excl_mark.visible = false;
            break

        case status_result:
            if (Game.result >= 0) {
                text2.setText('WINNER : ' + Game.players[Game.result].name);
            } else {
                text2.setText("TIE !!!")
            }

            displaySprites();

            this.time.delayedCall((3000), restart, [], this);
            break;

        case status_loose:
            text1.setText('TOO SOON !!!');
            text2.setText('LOOSER : ' + Game.players[Game.result].name);

            displaySprites()

            this.time.delayedCall((3000), restart, [], this);
            break;
    }
}

function handleEvent() {
    let params;
    switch (Game.status) {
        case status_sleep:
            if (Game.player.id != null) {
                Client.callServer(Client.c_get_players);
                Game.status = status_connected;
            } else {
                Client.callServer(Client.c_new_player);
                Game.status = status_connect;
            }
            break;

        case status_start:
            params = [Game.player.id, -1];
            Client.callServer(Client.c_resolve_score, params);
            break;

        case status_engage:

            let score = Game.scoring(0);
            params = [Game.player.id, score];
            Client.callServer(Client.c_resolve_score, params);
            Game.status = status_resolve;
            break;

        case status_result:
        case status_loose:
            location.reload();
            break;
    }
}

function displaySprites() {
    switch (Game.status) {
        case status_wait:
            p_stand.visible = (Game.player.name == 'KIRBY');
            b_stand.visible = (Game.player.name == 'KNIGHT');
            break;

        case status_start:
            clearAllSprites()
            p_stand.visible = true;
            b_stand.visible = true;
            break;

        case status_result:
            clearAllSprites()
            if (Game.result >= 0) {
                p_atk.visible = (Game.players[Game.result].name == 'KIRBY');
                b_fall.visible = (Game.players[Game.result].name == 'KIRBY');
                b_atk.visible = (Game.players[Game.result].name == 'KNIGHT');
                p_fall.visible = (Game.players[Game.result].name == 'KNIGHT');
            } else {
                tie.visible = true;
            }
            break;

        case status_loose:
            clearAllSprites();
            p_stand.visible = (Game.players[Game.result].name == 'KNIGHT');
            b_loose.visible = (Game.players[Game.result].name == 'KNIGHT');
            b_stand.visible = (Game.players[Game.result].name == 'KIRBY');
            p_loose.visible = (Game.players[Game.result].name == 'KIRBY');
            break;
    }
}

function clearAllSprites() {
    p_stand.visible = false;
    p_loose.visible = false;
    p_atk.visible = false;
    p_fall.visible = false;

    b_stand.visible = false;
    b_loose.visible = false;
    b_atk.visible = false;
    b_fall.visible = false;

    tie.visible = false;
    excl_mark.visible = false;
}

function clearTexts() {
    text1.setText('');
    text2.setText('');
}

function engage() {
    if (Game.status != status_loose) {
        excl_mark.visible = true;
        Game.scoring(1);
        Game.status = status_engage;
    }
}

function restart() {
    text1.setText('Touch or press any key to reload !');
}

Game.updatePlayer = function (player) {
    Game.player = player;
    Game.status = status_connected;
}

Game.updatePlayers = function (players) {
    players.forEach(function (player) {
        Game.players[player.id] = player;
    });
}

Game.start = function (time) {
    Game.time = time;
    Game.status = status_start;
}

var t0 = 0;
Game.scoring = function (i) {
    if (i == 1) {
        t0 = new Date().getTime();
    } else {
        let result = new Date().getTime() - t0;
        console.log('Score: ' + result);
        return result
    }
}

Game.handleResult = function (id, isLoose) {
    Game.result = id;
    if (isLoose) {
        Game.status = status_loose;
    } else {
        Game.status = status_result;
    }
}
