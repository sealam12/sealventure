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

                for (const [Index, Itm] of this.Inventory.entries()) {
                    const Selected = (Index == Selection);
                    const Prefix = Selected ? '*' : '';
                    const Color = (this.EquippedItem == Itm) ? "cyan" : (Selected ? "coral" : "");

                    OverlayHelper.WriteToOverlay(ContainerOverlay, `${Prefix}${Itm.Name}`, 2, Index+1, Color);
                }

                if (this.Inventory.length == 0) {
                    OverlayHelper.WriteToOverlay(ContainerOverlay, "Inventory Empty", 2, 1);
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