const status_sleep = '0';
const status_connect = '1';
const status_connected = '2';
const status_wait = '3';
const status_start = '4';
const status_engage = '5';
const status_resolve = '6';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: document.getElementById('game'),
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
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
var text1, text2;
var pink, blue, tie, excl_mark;

function preload() {
    this.load.image('sky', 'assets/space.png');
    this.load.image('tie', 'assets/tie.png');
    this.load.image('excl_mark', 'assets/excl_mark.png');
    this.load.spritesheet('pink',
        'assets/pink.png',
        { frameWidth: 164, frameHeight: 128 });
    this.load.spritesheet('blue',
        'assets/blue.png',
        { frameWidth: 204, frameHeight: 152 });
}

function create() {
    Game.players = {};
    Game.player = {};
    Game.status = status_sleep;

    this.add.image(400, 300, 'sky');
    pink = this.add.image(200, 450, 'pink');
    blue = this.add.image(600, 442, 'blue');
    tie = this.add.image(400, 466, 'tie');
    excl_mark = this.add.image(400, 300, 'excl_mark');

    pink.visible = false;
    blue.visible = false;
    tie.visible = false;
    excl_mark.visible = false;

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
            text1.setText('Touch or press any key');
            text2.setText('');
            break;
        case status_connect:
            text1.setText('Connecting ...');
            break;
        case status_connected:
            text1.setText('Connected !');
            text2.setText('Playing as ' + Game.player.name);
            if (Game.player.name == 'PINK') {
                pink.visible = true;
            } else {
                blue.visible = true;
            }
            Game.status = status_wait;
            break;
        case status_wait:
            text1.setText('Waiting for player ...');
            if (Object.keys(Game.players).length == 2) {
                if (Game.player.name == 'PINK') {
                    blue.visible = true;
                } else {
                    pink.visible = true;
                }
            }
            break;
        case status_start:
            text1.setText('Game Starting');
            text2.setText('Stand ready !');
            this.time.delayedCall((Game.time * 1000), engage, [], this);
            t_engage = time;
            Game.status = status_engage;
            break;
        case status_engage:
            // rien
            break
        case status_resolve:
            break
    }
}

function handleEvent() {
    switch (Game.status) {
        case status_sleep:
            Client.getPlayer();
            status = status_connect;
            break;
        case status_engage:
            t_resolve = timer;
            status = status_resolve;
            break;
        case status_resolve:
            let score = t_resolve - t_engage;
            Client.getWinner(Game.player.id, score);
            break
    }
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

Game.startGame = function (time) {
    Game.status = status_start;
    Game.time = time;
}

function engage() {
    text1.visible = false;
    text2.visible = false;
    excl_mark.visible = true;
}
