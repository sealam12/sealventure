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
    constructor(Name, Char, Damage, Metadata, Enchantments) {
        this.Name = Name;
        this.Char = Char;
        this.BaseDamage = Damage;
        this.Damage = Damage;
        this.Enchantments = Enchantments || [];
        this.Metadata = Metadata || {};
    }

    Use() {
        
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
    constructor(Char, Collision, Color, Name, Health, Inventory, Hostile) {
        super(Char, Collision, Color, Name);
        this.Health = Health;
        this.Inventory = Inventory || [];

        this.Hostile = Hostile != undefined ? Hostile : true;
    }
 
    Interact(Item) {}
    Tick(X, Y) {
        if (!this.Hostile) return;

        let PX = window.Game.Player.PositionX;
        let PY = window.Game.Player.PositionY;

        if (distance(PX, PY, X, Y) > 8) return;
        if (distance(PX, PY, X, Y) < 1.5) {
            window.Game.Player.GiveDamage(10);  
        }

        let DiffX = PX - X;
        let DiffY = PY - Y;

        let NewX = Math.min(Math.max(Math.round(DiffX), -1), 1) + X;
        let NewY = Math.min(Math.max(Math.round(DiffY), -1), 1) + Y;

        if (Math.random() < 0.5) {
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

// WRITTEN BY MATTHEW CARMICHAEL, 2025