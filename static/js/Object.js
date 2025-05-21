import { OverlayHelper } from "/static/js/OverlayHelper.js";
import { Overlay } from "/static/js/Display.js";
import { distance } from "/static/js/Utils.js";

export class DisplayObject {
    constructor(Char, Color) {
        this.Char = Char;
        this.Color = Color || "white";
        this.Blank = false;
    }

    GetCharText() {
        return `<span style="color: ${this.Color};">${this.Char}</span>`;
    }
}

export class Enchantment {
    constructor(Effect, Type, Amount) {
        this.Effect = Effect; // eg. Damage, health
        this.Type = Type; // eg. Multiply, add
        this.Amount = Amount; // eg. 1, 100, -50
    }
}

export class Item {
    constructor(Name, Char, Damage, Worth, Metadata, Enchantments) {
        this.Name = Name;
        this.Char = Char;
        this.BaseDamage = Damage;
        this.Damage = Damage;
        this.Worth = Worth;
        this.Enchantments = Enchantments || [];
        this.Metadata = Metadata || {};
    }

    Use() {}

    RemoveFromInventory() {
        let inv = window.Game.Player.Inventory;
        let index = inv.indexOf(this);
        if (index > -1) {
            window.Game.Player.Inventory.splice(index, 1);
        }
    }

    GetDamage() {
        let Damage = this.Damage;

        for (const Ench of this.Enchantments) {
            if (Ench.Type == "Damage") {
                if (Ench.Type == "MULTIPLY") Damage *= Ench.Amount;
                if (Ench.Type == "ADD") Damage += Ench.Amount;
            }
        }

        return Damage;
    }

    Clone() {  
        const clonedItem = new Item(  
            this.Name,  
            this.Char,  
            this.Damage,  
            this.Worth,
            { ...this.Metadata }, // Shallow copy of Metadata  
            [...this.Enchantments] // Shallow copy of Enchantments  
        );
    
        // Copy custom functions  
        for (const key in this) {  
            if (typeof this[key] === 'function') {  
                clonedItem[key] = this[key].bind(clonedItem);  
            }
        }  
    
        return clonedItem;  
    }
}

export class MapObject {
    constructor(Char, Collision, Color, Name) {
        this.Char = Char;
        this.Collision = Collision;
        this.Color = Color || "white";
        this.Name = Name || "";
    }

    Interact(Item) {}
    Tick() {}
}


export class Container extends MapObject {
    constructor(Char, Collision, Color, Name, Items) {
        super(Char, Collision, Color, Name);
        this.Items = Items;
    }

    Tick() {}
    
    Interact(Item) {
        let ContainerOverlay = new Overlay(
            3, 
            12,
            OverlayHelper.GenerateBox(6, 44, this.Name, "[SELECT] To Take"),
            this.Items.length, 

            function() {
                if (!this.Items) return;
                ContainerOverlay.Content = OverlayHelper.GenerateBox(6, 44, this.Name, "[SELECT] To Take");
                const Selection = window.Game.Player.OverlaySelection;

                let Offset = Selection > 1 ? Selection-2 : 0;

                for (const [Index, Itm] of this.Items.slice(0+Offset,4+Offset).entries()) {
                    const Selected = (this.Items.indexOf(Itm) == Selection);
                    const Prefix = Selected ? '*' : '';
                    const Color = Selected ? "coral" : "";

                    OverlayHelper.WriteToOverlay(ContainerOverlay, `${Prefix}${Itm.Name}`, 2, Index+1, Color);
                }

                if (this.Items.length == 0) {
                    OverlayHelper.WriteToOverlay(ContainerOverlay, "Container Empty", 2, 1, "goldenrod");
                }
            }.bind(this),

            function() {
                const Selection = window.Game.Player.OverlaySelection;
                const Item = this.Items[Selection];

                window.Game.Player.Inventory.push(Item);

                this.Items.splice(Selection, 1);
                ContainerOverlay.SelectCount = this.Items.length;
            }.bind(this)
        );

        window.Game.ActiveOverlay = ContainerOverlay;
    }
}

export class Entity extends MapObject {
    constructor(Char, Collision, Color, Name, Health, Inventory, Hostile, Damage) {
        super(Char, Collision, Color, Name);
        this.Health = Health;
        this.Inventory = Inventory || [];

        this.Hostile = Hostile != undefined ? Hostile : true;
        this.Damage = Damage || 0;

        this.LastAttack = window.Game.Ticks;
    }
 
    Interact(Item) {}
    Tick(X, Y) {
        if (!this.Hostile) return;
        if (window.Game.Ticks % window.Game.EntityTickRate != 0) return;

        let PX = window.Game.Player.PositionX;
        let PY = window.Game.Player.PositionY;

        if (distance(PX, PY, X, Y) > 8) {
            if ( window.Game.Ticks - this.LastAttack > 200 ) this.LastAttack = 0;
        };
        if (distance(PX, PY, X, Y) < 1.5) {
            if (window.Game.Ticks - this.LastAttack > 80 && this.LastAttack != 0) {
                window.Game.Player.GiveDamage(this.Damage); 
                this.LastAttack = window.Game.Ticks;
            }

            if (this.LastAttack == 0) this.LastAttack = window.Game.Ticks;
        }

        let DiffX = PX - X;
        let DiffY = PY - Y;

        let NewX = Math.min(Math.max(Math.round(DiffX), -1), 1) + X;
        let NewY = Math.min(Math.max(Math.round(DiffY), -1), 1) + Y;

        let r = Math.random();
        if (r < 0.5) {
            NewX = X;
        } else {
            NewY = Y;
        }

        this.MoveTo = [NewX, NewY];
    }

    Die() {
        this.ReplaceWith = new Container(this.Char.toLowerCase(), this.Collision, "gold", this.Name + " - Dead", this.Inventory);
    }

    Attack(Damage) {
        this.Health -= Damage;

        if (this.Health <= 0) {
            this.Die();
        }
    }
}

export class Projectile extends MapObject {
    constructor(Char, Color, Name, Damage, Velocity) {
        super(Char, true, Color, Name);

        this.Damage = Damage || 0;
        this.Velocity = Velocity || [1, 0];

        this.LastX = -1;
        this.LastY = -1;
    }

    Tick(X, Y) {
        if (this.LastX == X && this.LastY == Y) {
            this.ReplaceWith = new MapObject(" ", false);
            return;
        }

        this.LastY = Y;
        this.LastX = X;

        const V = this.Velocity;
        let NX = X + V[0];
        let NY = Y + V[1];

        this.MoveTo = [NX, NY];
    }
}

// WRITTEN BY MATTHEW CARMICHAEL, 2025