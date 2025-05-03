import { OverlayHelper } from "/static/js/OverlayHelper.js";
import { Overlay } from "/static/js/Display.js";

export class Item {
    constructor(Name, Char) {
        this.Name = Name;
        this.Char = Char;
    }
}

export class MapObject {
    constructor(Char, Collision, Color, Name) {
        this.Char = Char;
        this.Collision = Collision;
        this.Color = Color || "white";
        this.Name = Name || "MapObject";
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
        let Origin = OverlayHelper.GenerateBox(6, 44, this.Name, "[SELECT] To Take");
        let ContainerOverlay = new Overlay(
            3, 
            12,
            JSON.parse(JSON.stringify(Origin)),
            this.Items.length, 

            function() {
                if (!this.Items) return;
                ContainerOverlay.Content = JSON.parse(JSON.stringify(Origin));
                const Selection = window.Game.Player.OverlaySelection;

                for (const [Index, Itm] of this.Items.entries()) {
                    const Selected = (Index == Selection);
                    const Prefix = Selected ? '*' : '';
                    const Color = Selected ? "coral" : "";

                    OverlayHelper.WriteToOverlay(ContainerOverlay, `${Prefix}${Itm.Name}`, 2, Index+1, Color);
                }

                if (this.Items.length == 0) {
                    OverlayHelper.WriteToOverlay(ContainerOverlay, "Container Empty", 2, 1);
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