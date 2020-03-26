const status_sleep = '0';
const status_connect = '1';
const status_wait = '2';
const status_play = '3';


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

var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
var status, text;

function preload() {
    this.load.setBaseURL('http://labs.phaser.io');
    this.load.image('sky', 'assets/skies/space3.png');
}

function create() {
    this.add.image(400, 300, 'sky');

    text = this.add.text(0, 0, 'text here', style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    Phaser.Display.Align.In.Center(text, this.add.zone(400, 300, 800, 600));

    status = status_sleep;
    this.input.keyboard.on('keydown', handleEvent, this);
    this.input.on('pointerdown', handleEvent);
}

function update() {
    switch (status) {
        case status_sleep:
            text.setText('Touch or press any key !')
            break;
        case status_connect:
            text.setText('Connecting ...')
            break;
        case status_wait:
            text.setText('Waiting for player ...')
            break;
        case status_play:
            break;
    }
}

function handleEvent() {
    switch (status) {
        case status_sleep:
            status = status_connect;
            Client.askNewPlayer();
            break;
        case status_connect:
            break;
        case status_wait:
            break;
        case status_play:
            break;
    }
}

Game.addNewPlayer = function(id, name) {
    console.log('nique ta mère '+ name);
}
