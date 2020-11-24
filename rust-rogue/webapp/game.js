import {Engine, PlayerCore} from './gen/rust_rogue'


const Game = {
    display: null,
    engine: null,
    player: null,
    enemy: null,

    init: function() {
        console.log("init...")
        this.display = new ROT.Display({
            width: 125, heigth: 40
        });
        document.getElementById("rogueCanvas").appendChild(this.display.getContainer());
        this.engine = new Engine(this.display);
        this.generateMap();
    },
    
    generateMap: function() {
        var digger = new ROT.Map.Digger();
        var freeCells = [];
        var digCallback = function(x, y, value)  {
            if (!value) {
                var key = x + "," + y;
                freeCells.push(key);
            }
            this.engine.onDig(x,y,value);
        }
        digger.create(digCallback.bind(this));
        //this.generateBoxes(freeCells);
    
        this.engine.drawMap(freeCells);
    
        //this.player = this._createBeing(Player, freeCells);
        //this.enemy = this._createBeing(Checko, freeCells);
    },
};

Game.init();

