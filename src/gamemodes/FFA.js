const Mode = require('./Mode');
const Server = require('../Server');
class FFA extends Mode {
    constructor() {
        super();
        this.ID = 0;
        this.name = "Free For All";
        this.specByLeaderboard = true;
    }
    // Gamemode Specific Functions
    onPlayerSpawn(server, player) {
        player.color = server.getRandomColor();
        // Spawn player
        server.spawnPlayer(player, server.randomPos());
    }
    
    updateLB(server, lb) {
        server.leaderboardType = this.packetLB;
        for (var i = 0, pos = 0; i < server.clients.length; i++) {
            var player = server.clients[i].player;
            if (player.isRemoved || !player.cells.length ||
                player.socket.isConnected == false || (!server.config.minionsOnLeaderboard && player.isMi))
                continue;
            for (var j = 0; j < pos; j++)
                if (lb[j]._score < player._score)
                    break;
            lb.splice(j, 0, player);
            pos++;
        }
        this.rankOne = lb[0];
    }
    

    
    ejectMass(client) {
        setInterval( () => {
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
    }, 1);
    };
}

module.exports = FFA;
FFA.prototype = new Mode();
