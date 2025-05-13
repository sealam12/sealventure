import { Item } from "/static/js/Object.js";  
  
export const Items = {  
    // Tier 1 Items  
    RustySword: new Item("Rusty Sword", "s", 5),  
    WoodenBow: new Item("Wooden Bow", "b", 3),  
    LeatherArmor: new Item("Leather Armor", "a", 2),  
    ClothRobes: new Item("Cloth Robes", "r", 1),  
  
    // Tier 2 Items  
    FlamingBow: new Item("Flaming Bow", "b", 7),  
    IronDagger: new Item("Iron Dagger", "d", 6),  
    ChainmailArmor: new Item("Chainmail Armor", "a", 4),  
    StuddedLeatherArmor: new Item("Studded Leather Armor", "a", 3),  
  
    // Tier 3 Items  
    ThunderHammer: new Item("Thunder Hammer", "h", 10),  
    IceStaff: new Item("Ice Staff", "s", 8),  
  
    // Tier 4 Items  
    LegendaryGreatsword: new Item("Legendary Greatsword", "s", 15),  
    CelestialBow: new Item("Celestial Bow", "b", 12),  
};  
  
export const Tiers = {
    "1": [
        Items.RustySword,  
        Items.WoodenBow,  
        Items.LeatherArmor,  
        Items.ClothRobes,
    ],

    "2": [
        Items.FlamingBow,  
        Items.IronDagger,
        Items.ChainmailArmor,  
        Items.StuddedLeatherArmor,  
    ],

    "3": [
        Items.ThunderHammer,  
        Items.IceStaff,  
    ],

    "4": [
        Items.LegendaryGreatsword,  
        Items.CelestialBow,  
    ]
};