import { OverlayHelper } from "/static/js/OverlayHelper.js";
import { Overlay } from "/static/js/Display.js";

export class Player {
    constructor(X, Y) {
        this.PositionX = X;
        this.PositionY = Y;

        this.Selection = 0;
        this.OverlaySelection = 0;

        this.Inventory = [];
        this.EquippedItem = undefined;
    }

    InventoryOverlay() {
        // Stolen from Object.js but it works OK?
        let Origin = OverlayHelper.GenerateBox(6, 44, "Inventory", "[SELECT] To Equip");
        let ContainerOverlay = new Overlay(
            3, 
            12,
            JSON.parse(JSON.stringify(Origin)),
            this.Inventory.length, 

            function() {
                if (!this.Inventory) return;
                ContainerOverlay.Content = JSON.parse(JSON.stringify(Origin));
                const Selection = window.Game.Player.OverlaySelection;

                let Offset = Selection > 1 ? Selection-2 : 0;

                for (const [Index, Itm] of this.Inventory.slice(0+Offset,4+Offset).entries()) {
                    const Selected = (this.Inventory.indexOf(Itm) == Selection);
                    const Prefix = Selected ? '*' : '';
                    const Color = (this.EquippedItem == Itm) ? "aquamarine" : (Selected ? "coral" : "");

                    OverlayHelper.WriteToOverlay(ContainerOverlay, `${Prefix}${Itm.Name}`, 2, Index+1, Color);
                }

                if (this.Inventory.length == 0) {
                    OverlayHelper.WriteToOverlay(ContainerOverlay, "Inventory Empty", 2, 1, "goldenrod");
                }
            }.bind(this),

            function() {
                const Selection = window.Game.Player.OverlaySelection;
                const Item = this.Inventory[Selection];

                this.EquippedItem = Item;
            }.bind(this)
        );

        window.Game.ActiveOverlay = ContainerOverlay;
    }

    GetSelectedXY() {
        let CurrentXY;

        if (this.Selection == 0) CurrentXY = [0, -1];
        if (this.Selection == 1) CurrentXY = [1, -1];
        if (this.Selection == 2) CurrentXY = [1, 0];
        if (this.Selection == 3) CurrentXY = [1, 1];
        if (this.Selection == 4) CurrentXY = [0, 1];
        if (this.Selection == 5) CurrentXY = [-1, 1];
        if (this.Selection == 6) CurrentXY = [-1, 0];
        if (this.Selection == 7) CurrentXY = [-1, -1];

        return { X: CurrentXY[0] + this.PositionX, Y: CurrentXY[1] + this.PositionY };
    }
}