import { OverlayHelper } from "/static/js/OverlayHelper.js";
import { Overlay } from "/static/js/Display.js";

export class Item {
    constructor(Name, Char, Damage) {
        this.Name = Name;
        this.Char = Char;
        this.Damage = Damage;
    }
}

export class MapObject {
    constructor(Char, Collision, Color, Name) {
        this.Char = Char;
        this.Collision = Collision;
        this.Color = Color || "white";
        this.Name = Name || "";
    }

    Interact() {}
}

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

export class Container extends MapObject {
    constructor(Char, Collision, Color, Name, Items) {
        super(Char, Collision, Color, Name);
        this.Items = Items;
    }
    
    Interact() {
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
    constructor(Char, Collision, Color, Name, Health, Inventory) {
        super(Char, Collision, Color, Name);
        this.Health = Health;
        this.Inventory = Inventory || [];
    }

    Interact() {}

    Die() {
        this.ReplaceWith = new Container(this.Char, this.Collision, "gold", this.Name + " - Dead", this.Inventory);
    }

    Attack(Item) {
        this.Health -= Item.Damage;

        if (this.Health <= 0) {
            this.Die();
        }
    }
}

// WRITTEN BY MATTHEW CARMICHAEL, 2025