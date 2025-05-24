import { Item, Projectile } from "/static/js/Object.js";

// Item factory function to create items with consistent properties
function CreateItem(Name, Char, Damage, Worth, Metadata = {}) {
    const DefaultMetadata = {
        ...Metadata
    };
    
    const Itm = new Item(Name, Char, Damage, Worth, DefaultMetadata);
    return Itm;
}

// Weapons
export const Weapons = {
    // Tier 1 (Levels 1-3)
    RustySword: CreateItem("Rusty Sword", "s", 2, 4),
    WoodenBow: CreateItem("Wooden Bow", "b", 1, 4),
    BrokenDagger: CreateItem("Broken Dagger", "d", 1, 6),
    
    // Tier 2 (Levels 4-6)
    IronSword: CreateItem("Iron Sword", "s", 3, 8),
    HunterBow: CreateItem("Hunter's Bow", "b", 2, 8),
    SteelDagger: CreateItem("Steel Dagger", "d", 2, 12),
    
    // Tier 3 (Levels 7-9)
    FlamingSword: CreateItem("Flaming Sword", "S", 6, 22),
    FrostBow: CreateItem("Frost Bow", "B", 4, 22),
    ThunderHammer: CreateItem("Thunder Hammer", "H", 6, 24),
    
    // Tier 4 (Levels 10-12)
    VoidBlade: CreateItem("Void Blade", "S", 9, 52),
    DragonslayerBow: CreateItem("Dragonslayer Bow", "B", 7, 54),
    
    // Tier 5 (Levels 13+)
    CelestialGreatsword: CreateItem("Celestial Greatsword", "Ω", 14, 96),
    EtherealBow: CreateItem("Ethereal Bow", "Φ", 12, 96)
};

Weapons.WoodenBow.Metadata.ProjectileLauncher = true;
Weapons.HunterBow.Metadata.ProjectileLauncher = true;
Weapons.FrostBow.Metadata.ProjectileLauncher = true;
Weapons.DragonslayerBow.Metadata.ProjectileLauncher = true;
Weapons.EtherealBow.Metadata.ProjectileLauncher = true;

Weapons.WoodenBow.Metadata.Projectile = new Projectile(">", "white", "Arrow");
Weapons.HunterBow.Metadata.Projectile = new Projectile(">", "white", "Arrow");
Weapons.FrostBow.Metadata.Projectile = new Projectile(">", "aqua", "Arrow");
Weapons.DragonslayerBow.Metadata.Projectile = new Projectile(">", "indigo", "Arrow");
Weapons.EtherealBow.Metadata.Projectile = new Projectile(">", "magenta", "Arrow");

// Armor
export const Armor = {
    // Tier 1
    ClothRobes: CreateItem("Cloth Robes", "r", 0, 4,               {DamageMultiplier: 0.99}),
    LeatherArmor: CreateItem("Leather Armor", "a", 0, 4,           {DamageMultiplier: 0.95}),
    
    // Tier 2
    StuddedLeather: CreateItem("Studded Leather", "a", 0, 8,       {DamageMultiplier: 0.85}),
    ChainmailArmor: CreateItem("Chainmail Armor", "A", 0, 8,       {DamageMultiplier: 0.8}),
    
    // Tier 3
    ScaleMail: CreateItem("Scale Mail", "A", 0, 14,                {DamageMultiplier: 0.75}),
    EnchantedCloak: CreateItem("Enchanted Cloak", "C", 0, 18,      {DamageMultiplier: 0.70}),
    
    // Tier 4
    DragonscaleArmor: CreateItem("Dragonscale Armor", "A", 0, 22,  {DamageMultiplier: 0.60}),
    
    // Tier 5
    CelestialPlate: CreateItem("Celestial Plate", "Δ", 0, 32,      {DamageMultiplier: 0.45})
};


for (const [Key, Item] of Object.entries(Armor)) {
    Item.Metadata["ArmorSlot"] = true;
}

// Consumables
export const Consumables = {
    // Healing
    MinorHealthPotion: CreateItem("Minor Health Potion", "h", 0, 4),
    HealthPotion: CreateItem("Health Potion", "h", 0, 16),
    GreaterHealthPotion: CreateItem("Greater Health Potion", "H", 64),
    
    // Buffs
    StrengthElixir: CreateItem("Strength Elixir", "e", 0, 48),
    ShieldPotion: CreateItem("Shield Potion", "p", 0, 48),
};

function Heal(AMT) { window.Game.Player.Health += AMT; }
Consumables.MinorHealthPotion.Use = function() {Heal(5); this.RemoveFromInventory();}
Consumables.HealthPotion.Use = function() {Heal(15); this.RemoveFromInventory();}
Consumables.GreaterHealthPotion.Use = function() {Heal(30); this.RemoveFromInventory();}

Consumables.StrengthElixir.Use = function() {window.Game.Player.DamageMultiplier *= 1.2; this.RemoveFromInventory();}
Consumables.ShieldPotion.Use = function() {window.Game.Player.ShieldMultiplier *= 0.9; this.RemoveFromInventory();}

// Special Items
export const SpecialItems = {
    DungeonKey: CreateItem("Dungeon Key", "k", 0, 128),
    AncientRelic: CreateItem("Ancient Relic", "r", 0, 256)
};

// Organize items by tier for easy access
export const Tiers = {
    "1": [
        Weapons.RustySword, 
        Weapons.WoodenBow, 
        Weapons.BrokenDagger,
        Armor.ClothRobes, 
        Armor.LeatherArmor,
        Consumables.MinorHealthPotion
    ],
    "2": [
        Weapons.IronSword, 
        Weapons.HunterBow, 
        Weapons.SteelDagger,
        Armor.StuddedLeather, 
        Armor.ChainmailArmor,
        Consumables.HealthPotion,
        Consumables.StrengthElixir,
        SpecialItems.DungeonKey
    ],
    "3": [
        Weapons.FlamingSword, 
        Weapons.FrostBow, 
        Weapons.ThunderHammer,
        Armor.ScaleMail, 
        Armor.EnchantedCloak,
        Consumables.GreaterHealthPotion,
        Consumables.ShieldPotion,
    ],
    "4": [
        Weapons.VoidBlade, 
        Weapons.DragonslayerBow,
        Armor.DragonscaleArmor,
        SpecialItems.AncientRelic
    ],
    "5": [
        Weapons.CelestialGreatsword, 
        Weapons.EtherealBow,
        Armor.CelestialPlate
    ]
};

// Helper function to get random items based on dungeon depth
export function GetRandomItemsByDepth(Depth, Count = 1) {
    // Determine which tiers to pull from based on depth
    let AvailableTiers = [];
    
    if (Depth <= 3) {
        AvailableTiers = ["1"];
        // Small chance of tier 2
        if (Math.random() < 0.1) AvailableTiers.push("2");
    } else if (Depth <= 6) {
        AvailableTiers = ["1", "2"];
        // Small chance of tier 3
        if (Math.random() < 0.15) AvailableTiers.push("3");
    } else if (Depth <= 9) {
        AvailableTiers = ["2", "3"];
        // Small chance of tier 4
        if (Math.random() < 0.1) AvailableTiers.push("4");
    } else if (Depth <= 12) {
        AvailableTiers = ["3", "4"];
        // Small chance of tier 5
        if (Math.random() < 0.05) AvailableTiers.push("5");
    } else {
        AvailableTiers = ["4", "5"];
    }
    
    // Get random items from the available tiers
    const Items = [];
    for (let i = 0; i < Count; i++) {
        const TierIndex = Math.floor(Math.random() * AvailableTiers.length);
        const Tier = AvailableTiers[TierIndex];
        const TierItems = Tiers[Tier];
        const ItemIndex = Math.floor(Math.random() * TierItems.length);
        Items.push(TierItems[ItemIndex].Clone());
    }
    
    return Items;
}

// Export all categories for easy access
export const Items = {
    ...Weapons,
    ...Armor,
    ...Consumables,
    ...SpecialItems
};