const FFA = require('./FFA'); // Base gamemode
const Virus = require('../entity/Virus');
class Rainbow extends FFA{
    constructor() {
        super();
        this.ID = 3;
        this.name = "Rainbow FFA";
        this.specByLeaderboard = true;
        this.speed = 1; // Speed of color change
        this.colors = [
            { 'r': 41, 'g': 0, 'b': 0 },
            { 'r': 255, 'g': 64, 'b': 0 },
            { 'r': 64, 'g': 64, 'b': 0 }, 
        ];
    }
    // Gamemode Specific Functions
    changeColor(virus, server) {
        virus.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
    }
    canEat(cell) {  
        return false;
    }
    // Override
    onServerInit() { }
    onTick(server) {
        // Change color
        for (const node of server.nodes) {
            if (!node) continue;
            this.changeColor(node, server);
        }
    }
}

module.exports = Rainbow;
Rainbow.prototype = new FFA();
