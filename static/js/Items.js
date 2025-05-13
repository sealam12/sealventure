import { Item } from "/static/js/Object.js";

// Item factory function to create items with consistent properties
function CreateItem(Name, Char, Damage, Metadata = {}) {
    const DefaultMetadata = {
        Description: "",
        Rarity: 1, // 1-5 scale (common to legendary)
        Effects: [],
        ...Metadata
    };
    
    const Itm = new Item(Name, Char, Damage, DefaultMetadata);
    return Itm;
}

// Weapons
export const Weapons = {
    // Tier 1 (Levels 1-3)
    RustySword: CreateItem("Rusty Sword", "s", 3, {
        Description: "A worn sword with a dull edge.",
        Rarity: 1
    }),
    WoodenBow: CreateItem("Wooden Bow", "b", 2, {
        Description: "A simple bow carved from oak.",
        Rarity: 1
    }),
    BrokenDagger: CreateItem("Broken Dagger", "d", 1, {
        Description: "Half of what was once a decent blade.",
        Rarity: 1
    }),
    
    // Tier 2 (Levels 4-6)
    IronSword: CreateItem("Iron Sword", "s", 5, {
        Description: "A reliable iron blade.",
        Rarity: 2
    }),
    HunterBow: CreateItem("Hunter's Bow", "b", 4, {
        Description: "A well-crafted bow with decent range.",
        Rarity: 2
    }),
    SteelDagger: CreateItem("Steel Dagger", "d", 3, {
        Effects: ["Quick Attack"],
        Description: "A sharp dagger that strikes quickly.",
        Rarity: 2
    }),
    
    // Tier 3 (Levels 7-9)
    FlamingSword: CreateItem("Flaming Sword", "S", 8, {
        Effects: ["Fire Damage"],
        Description: "A blade enchanted with magical flames.",
        Rarity: 3
    }),
    FrostBow: CreateItem("Frost Bow", "B", 7, {
        Effects: ["Slow Target"],
        Description: "Arrows from this bow slow enemies with frost.",
        Rarity: 3
    }),
    ThunderHammer: CreateItem("Thunder Hammer", "H", 10, {
        Effects: ["Stun"],
        Description: "A massive hammer that crackles with electricity.",
        Rarity: 3
    }),
    
    // Tier 4 (Levels 10-12)
    VoidBlade: CreateItem("Void Blade", "S", 12, {
        Effects: ["Life Steal"],
        Description: "A dark blade that drains life from enemies.",
        Rarity: 4
    }),
    DragonslayerBow: CreateItem("Dragonslayer Bow", "B", 11, {
        Effects: ["Piercing", "Critical Hit"],
        Description: "A legendary bow said to have slain ancient dragons.",
        Rarity: 4
    }),
    
    // Tier 5 (Levels 13+)
    CelestialGreatsword: CreateItem("Celestial Greatsword", "Ω", 15, {
        Effects: ["Holy Damage", "Smite"],
        Description: "A massive blade forged from star metal.",
        Rarity: 5
    }),
    EtherealBow: CreateItem("Ethereal Bow", "Φ", 14, {
        Effects: ["Phase Shot", "Multi-Arrow"],
        Description: "A bow that seems to exist between dimensions.",
        Rarity: 5
    })
};

// Armor
export const Armor = {
    // Tier 1
    ClothRobes: CreateItem("Cloth Robes", "r", 0, {
        Defense: 1,
        Description: "Simple cloth robes offering minimal protection.",
        Rarity: 1
    }),
    LeatherArmor: CreateItem("Leather Armor", "a", 0, {
        Defense: 2,
        Description: "Basic armor made from tanned hides.",
        Rarity: 1
    }),
    
    // Tier 2
    StuddedLeather: CreateItem("Studded Leather", "a", 0, {
        Defense: 3,
        Description: "Leather reinforced with metal studs.",
        Rarity: 2
    }),
    ChainmailArmor: CreateItem("Chainmail Armor", "A", 0, {
        Defense: 4,
        Description: "Flexible armor made from interlocking metal rings.",
        Rarity: 2
    }),
    
    // Tier 3
    ScaleMail: CreateItem("Scale Mail", "A", 0, {
        Defense: 6,
        Description: "Armor made from overlapping metal scales.",
        Rarity: 3
    }),
    EnchantedCloak: CreateItem("Enchanted Cloak", "C", 0, {
        Defense: 5,
        Effects: ["Magic Resistance"],
        Description: "A cloak woven with protective enchantments.",
        Rarity: 3
    }),
    
    // Tier 4
    DragonscaleArmor: CreateItem("Dragonscale Armor", "A", 0, {
        Defense: 8,
        Effects: ["Fire Resistance"],
        Description: "Armor crafted from the scales of a dragon.",
        Rarity: 4
    }),
    
    // Tier 5
    CelestialPlate: CreateItem("Celestial Plate", "Δ", 0, {
        Defense: 10,
        Effects: ["Damage Reflection", "Regeneration"],
        Description: "Armor forged from materials not of this world.",
        Rarity: 5
    })
};

// Consumables
export const Consumables = {
    // Healing
    MinorHealthPotion: CreateItem("Minor Health Potion", "h", 0, {
        Heal: 20,
        Description: "A small vial of red liquid that restores some health.",
        Rarity: 1
    }),
    HealthPotion: CreateItem("Health Potion", "h", 0, {
        Heal: 50,
        Description: "A standard potion that restores health.",
        Rarity: 2
    }),
    GreaterHealthPotion: CreateItem("Greater Health Potion", "H", 0, {
        Heal: 100,
        Description: "A potent healing elixir.",
        Rarity: 3
    }),
    
    // Buffs
    StrengthElixir: CreateItem("Strength Elixir", "e", 0, {
        Effects: ["Strength +3"],
        Description: "Temporarily increases damage dealt.",
        Rarity: 2
    }),
    ShieldPotion: CreateItem("Shield Potion", "p", 0, {
        Effects: ["Temporary Shield"],
        Description: "Creates a magical barrier that absorbs damage.",
        Rarity: 3
    }),
    InvisibilityPotion: CreateItem("Invisibility Potion", "i", 0, {
        Effects: ["Invisibility"],
        Description: "Renders the drinker invisible for a short time.",
        Rarity: 4
    })
};

// Special Items
export const SpecialItems = {
    DungeonKey: CreateItem("Dungeon Key", "k", 0, {
        Description: "A key that unlocks a specific door.",
        Rarity: 2
    }),
    AncientRelic: CreateItem("Ancient Relic", "r", 0, {
        Value: 50,
        Description: "A mysterious artifact of unknown power.",
        Rarity: 4
    }),
    TreasureMap: CreateItem("Treasure Map", "m", 0, {
        Value: 30,
        Description: "Reveals the location of valuable treasure.",
        Rarity: 3
    })
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
        SpecialItems.TreasureMap
    ],
    "4": [
        Weapons.VoidBlade, 
        Weapons.DragonslayerBow,
        Armor.DragonscaleArmor,
        Consumables.InvisibilityPotion,
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
        Items.push(TierItems[ItemIndex]);
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