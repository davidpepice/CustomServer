const Cell = require('./Cell');
var PlayerCell = require('./PlayerCell');
var Server = require('../Server');
const send = (player, msg) => player.server.sendChatMessage(null, player, msg);
class Food extends Cell {
    constructor(server, owner, position, size) {
        super(server, owner, position, size);
        this.type = 1;
        this.isVirus = true;
        this.Food
        this.isMotherCell = true; // Not to confuse bots
        this.color = {
             r: 0xff, 
             g: 0x00, 
             b: 0x94 
        }; 
        this.setSize(50);
        this.powertimer = 5 * 1000 // 5 Seconds
        this.power = Math.round(Math.random() * (4 - 1) + 1); // 1 = Speed 2 = Minions 3 = Virus shoot for 5 seconds 4 = One Popsplit Virus w shot
        this.server = server;
    }
    // Main Functions
    canEat(cell) {
        // cannot eat if virusMaxAmount is reached
        if (this.server.nodesVirus.length < this.server.config.virusMaxAmount)
            return cell.type == 3; // virus can eat ejected mass only
    }
    onEat(prey) {
        // Called to eat prey cell
        this.setSize(Math.sqrt(this._radius2 + prey._radius2));
        if (this.radius >= this.server.config.virusMaxSize) {
            this.setSize(this.server.config.foodMaxSize); // Reset mass
            this.server.shootVirus(this, prey.boostDirection.angle());
        }
    }
    shootVirus(parent, angle) {
        // Create virus and add it to node list
        var pos = parent.position.clone();
        var newVirus = new Entity.Virus(this, null, pos, this.config.virusMinSize);
        newVirus.setBoost(this.config.virusVelocity, angle);
        this.addNode(newVirus);
    }
    onEaten (c) {
        var player = c.owner;
        var self = this;
        if (this.power == 1) {
            player.doublespeed = true;
                // OverRide
            this.server.sendChatMessage(null, player, "You have been gived with Double Speed For 20 Seconds!");
            setTimeout(function() {
            player.doublespeed = false;
            self.server.sendChatMessage(null, player, "YOUR DOUBLE SPEED POWERUP HAS RAN OUT!");
            }, this.powertimer);
        }
         else if (this.power == 2) {
            player.minionControl = true;
            for (var i = 0; i < 5; i++) {
                this.server.bots.addMinion(player);
            }
            this.server.sendChatMessage(null, player, "YOU HAVE BEEN GIVED WITH 5 MINIONS! FOR 20 SECONDS");
    
            setTimeout(function() {
                player.minionControl = false;
                player.miQ = 0;
                self.server.sendChatMessage(null, player, "YOUR MINIONS HAVE SUDDENLY VANISHED!");
            }, this.powertimer);
        } else if (this.power == 3) {
            player.shootVirus = true;
            this.server.sendChatMessage(null, player, "YOUR HAVE BEEN GRANTED THE ABILITY TO SHOOT VIRUSES!");
            setTimeout(function() {
                player.shootVirus = false;
                self.server.sendChatMessage(null, player, "YOU CAN NO LONGER SHOOT VIRUSES!");
            }, 5000);
        } else {
            // One popsplt shot
            player.canShootPopsplitVirus = true;
            this.server.sendChatMessage(null, player, "YOU CAN SHOOT ONE POPSPLIT VIRUS NOW! TURN PLAYERS INTO HUNDREDS OF PIECES!");
        }
    };
    explodeCell(cell, splits) {
        // for (var i = 0; i < splits.length; i++)
        //     this.server.splitPlayerCell(cell.owner, cell, 2 * Math.PI * Math.random(), splits[i]);
    }
    onAdd(server) {
        server.nodesFood.push(this);
    }
    onRemove(server) {
        server.nodesFood.removeUnsorted(this);
        if (!this.overrideReuse) server.spawnFood();
    }
}

module.exports = Food;

