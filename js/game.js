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
var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
var text, pointer, keyboard;

function preload() {
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');
    // this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    // this.load.image('red', 'assets/particles/red.png');
}

function create() {
    this.add.image(400, 300, 'sky');

    text = this.add.text(0, 0, "Press any key to start !", style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    Phaser.Display.Align.In.Center(text, this.add.zone(400, 300, 800, 600));

    keyboard = this.input.keyboard;
    pointer = this.input.activePointer;
    // var particles = this.add.particles('red');

    // var emitter = particles.createEmitter({
    //     speed: 100,
    //     scale: { start: 1, end: 0 },
    //     blendMode: 'ADD'
    // });

    // var logo = this.physics.add.image(400, 100, 'logo');

    // logo.setVelocity(100, 200);
    // logo.setBounce(1, 1);
    // logo.setCollideWorldBounds(true);

    // emitter.startFollow(logo);
}

function update() {
    if (pointer.isDown) {
        text.setText('Connecting ...');
    }
}