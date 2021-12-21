var FFA = require('./FFA'); // Base gamemode
var Entity = require('../entity');
var Server = require('../Server');

class Powers extends FFA {
    constructor(server, owner, position, size){
        super(server, owner, position, size);
        this.ID = 4;
        this.name = "Super Powers";
        this.specByLeaderboard = true;
        
        // Gamemode Specific Variables
        this.powerSpawnInterval = 25 * 10; // 10 Seconds
        this.powerMinAmount = 78;
        this.tickpowerSpawn = 0;
        this.nodesPower = [];
    }
 
    ejectMass (client) {
    if (!this.canEjectMass(client) || client.frozen)
        return;
    for (var i = 0; i < client.cells.length; i++) {
        var cell = client.cells[i];
        
        if (!cell || cell._size < this.config.playerMinSplitSize) {
            continue;
        }
        
        var dx = client.mouse.x - cell.position.x;
        var dy = client.mouse.y - cell.position.y;
        var dl = dx * dx + dy * dy;
        if (dl > 1) {
            dx /= Math.sqrt(dl);
            dy /= Math.sqrt(dl);
        } else {
            dx = 1;
            dy = 0;
        }
        
        // Remove mass from parent cell first
        var sizeLoss = this.config.ejectSizeLoss;
        var sizeSquared = cell._sizeSquared - sizeLoss * sizeLoss;
        cell.setSize(Math.sqrt(sizeSquared));
        
        // Get starting position
        var pos = {
            x: cell.position.x + dx * cell._size,
            y: cell.position.y + dy * cell._size
        };
        var angle = Math.atan2(dx, dy);
        if (isNaN(angle)) angle = Math.PI / 2;
        
        // Randomize angle
        angle += (Math.random() * 0.6) - 0.3;
        
        // Create cell
        if (client.canShootVirus || this.config.ejectVirus) {
            var ejected = new Entity.Virus(this, null, pos, this.config.ejectSize);
        } else if (client.canShootPopsplitVirus) {
            ejected = new Entity.PopsplitVirus(this, null, pos, this.config.ejectSize);
            client.canShootPopsplitVirus = false;
        } 
         else {
            ejected = new Entity.EjectedMass(this, null, pos, this.config.ejectSize);
        }
        ejected.setColor(cell.color);
        ejected.setBoost(780, angle);
        this.addNode(ejected);
     
    }
    Entity.PowerUP.prototype.onAdd = function () {
        self.nodesPower.push(this);
    };
    Entity.PowerUP.prototype.onRemove = function () {
        var index = self.nodesPower.indexOf(this);
        if (index != -1) 
        self.nodesPower.splice(index, 1);
    }
    }
    // spawnPowerUp(Server) {
    //     if (this.nodesPower.length >= this.powerMinAmount) {
    //         return;
    //     }
    //     var pos = Server.randomPos();
    //     if (Server.willCollide(pos, 149)) {
    //         // cannot find safe position => do not spawn
    //         return;
    //     }
    //     var Power = new Entity.PowerUP(Server, null, pos, null);
    //     Server.addNode(Power);
    // } 

    // onTick(Server) {
    //     if (this.tickpowerSpawn >= this.powerSpawnInterval) {
    //         this.tickPowerSpawn = 0;
    //         this.spawnPowerUp(gameServer);
    //     } else {
    //         this.tickpowerSpawn++;
    //     }
    // }  
 

}
module.exports = Powers;