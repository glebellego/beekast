const status_sleep = '0';
const status_connect = '1';
const status_connected = '2';
const status_wait = '3';
const status_start = '4';
const status_engage = '5';
const status_resolve = '6';
const status_result = '7';
const status_loose = '8';

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

    p_stand.visible = false;
    p_loose.visible = false;
    p_atk.visible = false;
    p_fall.visible = false;

    b_stand = this.add.image(600, 442, 'b_stand');
    b_loose = this.add.image(600, 442, 'b_fall');
    b_atk = this.add.image(150, 442, 'b_atk');
    b_fall = this.add.image(150, 442, 'b_fall');

    b_stand.visible = false;
    b_loose.visible = false;
    b_atk.visible = false;
    b_fall.visible = false;

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
            if (Game.player.name == 'KIRBY') {
                p_stand.visible = true;
            } else {
                b_stand.visible = true;
            }
            Game.status = status_wait;
            break;
        case status_wait:
            text1.setText('Waiting for player ...');
            if (Object.keys(Game.players).length == 2) {
                if (Game.player.name == 'KIRBY') {
                    b_stand.visible = true;
                } else {
                    p_stand.visible = true;
                }
            }
            break;
        case status_start:
            text1.setText('Game Starting');
            text2.setText('Stand ready !');
            this.time.delayedCall((2000), cleanText, [], this);
            this.time.delayedCall((Game.time * 1000), engage, [], this);
            break;
        case status_resolve:
            excl_mark.visible = false;
            break
        case status_result:
            excl_mark.visible = false;

            if (Game.result >= 0) {
                text2.setText('WINNER : ' + Game.players[Game.result].name);
                if (Game.players[Game.result].name == 'KIRBY') {
                    p_stand.visible = false;
                    p_atk.visible = true;
                    b_stand.visible = false;
                    b_fall.visible = true;
                } else {
                    b_stand.visible = false;
                    b_atk.visible = true;
                    p_stand.visible = false;
                    p_fall.visible = true;
                }
            } else {
                text2.setText("TIE !!!")
                p_stand.visible = false;
                b_stand.visible = false;
                tie.visible = true;
            }
            break;
        case status_loose:
            text1.setText('TOO SOON !!!');
            text2.setText('LOOSER : ' + Game.players[Game.result].name);
            if (Game.players[Game.result].name == 'KIRBY') {
                p_stand.visible = false;
                p_loose.visible = true;
            } else {
                b_stand.visible = false;
                b_loose.visible = true;
            }
            break;
    }
}

function handleEvent() {
    switch (Game.status) {
        case status_sleep:
            if (Game.player.id != null) {
                Client.getPlayers();
                Game.status = status_connected;
            } else {
                Client.getPlayer();
                Game.status = status_connect;
            }
            break;
        case status_start:
            Client.sendScore(Game.player.id, -1);
            break;
        case status_engage:
            let score = Game.scoring(0);
            Client.sendScore(Game.player.id, score);
            Game.status = status_resolve;
            break;
        case status_result:
        case status_loose:
            location.reload();
            break;
    }
}

function cleanText() {
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

Game.setResult = function (id, isLoose) {
    Game.result = id;
    if (isLoose) {
        Game.status = status_loose;
    } else {
        Game.status = status_result;
    }
}

// Game.handleDisconnction = function () {
//     Game.status = status_wait;
// }
