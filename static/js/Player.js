import { OverlayHelper } from "/static/js/OverlayHelper.js";
import { Overlay } from "/static/js/Display.js";

export class Player {
    constructor(X, Y) {
        this.PositionX = X;
        this.PositionY = Y;

        this.Selection = 0;
        this.OverlaySelection = 0;

        this.Health = 100;
        this.AttackCooldown = 400;

        this.Effects = {
            AttackCooldownAdd: 0,
            DamageAdd: 0,
            DamageMult: 1,
        }

        this.Inventory = [];
        this.EquippedItem = undefined;
        this.EquippedArmor = undefined;

        this.DamageMultiplier = 1; // Outgoing damage multiplier
        this.ShieldMultiplier = 1; // Incoming damage multiplier

        this.Money = 0;
    }

    GiveDamage(DamageAmount) {
        let Dmg = Math.floor(DamageAmount * this.ShieldMultiplier);

        if (this.EquippedArmor && this.EquippedArmor.Metadata) {
            Dmg = Math.floor( Dmg * ( this.EquippedArmor.Metadata.DamageMultiplier || 1 ) );
        }

        this.Health -= Dmg;

        if (this.Health < 0) {
            document.body.innerHTML = "You died, I will make a better death system later. Reload to play again with a new map.";
        }
    }

    GetDamage() {
        let Dmg = this.EquippedItem.GetDamage() * this.DamageMultiplier;
        return Dmg;
    }

    GetCooldown() {
        let CD = this.AttackCooldown;

        if (this.EquippedArmor) {
            for (const Ench of this.EquippedArmor.Enchantments) {
                if (Ench.Type == "Damage") {
                    if (Ench.Type == "MULTIPLY") CD *= Ench.Amount;
                    if (Ench.Type == "ADD") CD += Ench.Amount;
                }
            }
        }

        if (this.EquippedItem) {
            for (const Ench of this.EquippedItem.Enchantments) {
                if (Ench.Type == "Damage") {
                    if (Ench.Type == "MULTIPLY") CD *= Ench.Amount;
                    if (Ench.Type == "ADD") CD += Ench.Amount;
                }
            }
        }

        return 400;
    }

    InventoryOverlay() {
        // Stolen from Object.js but it works OK?
        let ContainerOverlay = new Overlay(
            3, 
            12,
            OverlayHelper.GenerateBox(6, 44, "Inventory", "[SELECT/USE] To Equip/Use"),
            this.Inventory.length, 

            function() {
                if (!this.Inventory) return;
                
                ContainerOverlay.Content = OverlayHelper.GenerateBox(6, 44, "Inventory", "[SELECT/USE] To Equip/Use");
                const Selection = window.Game.Player.OverlaySelection;

                let Offset = Selection > 1 ? Selection-2 : 0;

                for (const [Index, Itm] of this.Inventory.slice(0+Offset,4+Offset).entries()) {
                    const Selected = (Index+Offset == Selection);
                    const Prefix = Selected ? '*' : '';
                    let Color = (this.EquippedItem === Itm) ? "aquamarine" : (Selected ? "coral" : "");
                    if (this.EquippedArmor === Itm) {
                        Color = "magenta";
                    }

                    OverlayHelper.WriteToOverlay(ContainerOverlay, `${Prefix}${Itm.Name}`, 2, Index+1, Color);
                }

                if (this.Inventory.length == 0) {
                    OverlayHelper.WriteToOverlay(ContainerOverlay, "Inventory Empty", 2, 1, "goldenrod");
                }
            }.bind(this),

            function() {
                const Selection = window.Game.Player.OverlaySelection;
                const Item = this.Inventory[Selection];

                if (!Item || !Item.Metadata) return;
                if (Item.Metadata.ArmorSlot) {
                    this.EquippedArmor = Item;
                } else {
                    this.EquippedItem = Item;
                }
            }.bind(this),

            function() {
                const Selection = window.Game.Player.OverlaySelection;
                const Item = this.Inventory[Selection];

                Item.Use();
            }.bind(this),
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

// WRITTEN BY MATTHEW CARMICHAEL, 2025