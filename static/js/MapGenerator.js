import { MapObject, Item, Container, Entity, Projectile } from "/static/js/Object.js";
import { Map } from "/static/js/Map.js";
import { GetRandomItemsByDepth, Weapons, Consumables, Armor } from "/static/js/Items.js";
import { Overlay } from "/static/js/Display.js";
import { OverlayHelper } from "/static/js/OverlayHelper.js";

export class Room {
    constructor(RoomID, Type, Parent, Keys, Children) {
        this.RoomID = RoomID;
        this.Type = Type,
        this.Keys = Keys || [];
        this.Children = Children || [];
        this.Parent = Parent;

        this.Unlocked = false;
    }

    AddKey(Key) {
        this.Keys.push(Key);
    }

    AddChild(Child) {
        this.Children.push(Child);
    }
}


export class RoomGenerator {
    static BlankRoom() {
        let Content = [];
        const R = 20;
        const C = 50;

        for (let r = 0; r < R; r++) {
            Content.push([]);
            for (let c = 0; c < C; c++) {
                if (r == 0 || r == R-1 || c == 0 || c == C-1) {
                    Content[r].push(new MapObject("#", true, "white", "Wall"));
                } else {
                    Content[r].push(new MapObject(" ", false, "white", ""));
                }
            }
        }
        return Content;
    }

    // Generate random cover/obstacles in the room
    static GenerateObstacles(Content, Density = 0.1) {
        const R = 20;
        const C = 50;
        
        // Avoid edges
        for (let r = 2; r < R-2; r++) {
            for (let c = 2; c < C-2; c++) {
                // Skip if already has content
                if (Content[r][c].Symbol !== " ") continue;
                
                // Random chance to place obstacle based on density
                if (Math.random() < Density) {
                    Content[r][c] = new MapObject("#", true, "gray", "Cover");
                }
            }
        }
        
        return Content;
    }
    
    // Generate enemies based on room depth
    static GenerateEnemies(Content, Depth, Count = 3) {
        const R = 20;
        const C = 50;
        
        // Scale enemy stats based on depth
        const BaseHealth = 5 + Math.floor(Depth * 1.5);
        const BaseDamage = 1 + Math.floor(Depth * 0.5);
        
        // Enemy types with different properties
        const EnemyTypes = [
            { Symbol: "E", Color: "red", Name: "Goblin", HealthMod: 0.8, DamageMod: 1 },
            { Symbol: "O", Color: "darkred", Name: "Orc", HealthMod: 1.2, DamageMod: 1.2 },
            { Symbol: "S", Color: "purple", Name: "Skeleton", HealthMod: 0.9, DamageMod: 0.9 },
            { Symbol: "T", Color: "green", Name: "Troll", HealthMod: 1.5, DamageMod: 1.3 },
            { Symbol: "D", Color: "crimson", Name: "Demon", HealthMod: 1.3, DamageMod: 1.5 }
        ];
        
        // Add boss enemy for deeper levels
        if (Depth > 5 && Math.random() < 0.3) {
            const BossType = {
                Symbol: "B", 
                Color: "darkmagenta", 
                Name: `Level ${Depth} Boss`, 
                HealthMod: 2.5, 
                DamageMod: 2
            };
            EnemyTypes.push(BossType);
        }
        
        // Place enemies randomly
        for (let i = 0; i < Count; i++) {
            // Try to find an empty spot
            let Attempts = 0;
            let Placed = false;
            
            while (!Placed && Attempts < 20) {
                const r = Math.floor(Math.random() * (R-4)) + 2;
                const c = Math.floor(Math.random() * (C-4)) + 2;
                
                if (Content[r][c].Char === " ") {
                    // Select enemy type - higher chance of stronger enemies at deeper levels
                    let TypeIndex;
                    if (Depth > 10) {
                        TypeIndex = Math.floor(Math.random() * EnemyTypes.length);
                    } else if (Depth > 5) {
                        TypeIndex = Math.floor(Math.random() * Math.min(4, EnemyTypes.length));
                    } else {
                        TypeIndex = Math.floor(Math.random() * Math.min(3, EnemyTypes.length));
                    }
                    
                    const Type = EnemyTypes[TypeIndex];
                    const Health = Math.floor(BaseHealth * Type.HealthMod);
                    const Damage = Math.floor(BaseDamage * Type.DamageMod);
                    
                    // Generate loot for enemy based on depth
                    const EnemyLoot = GetRandomItemsByDepth(Depth, Math.ceil(Depth / 4));
                    
                    Content[r][c] = new Entity(
                        Type.Symbol, 
                        true, 
                        Type.Color, 
                        Type.Name, 
                        Health, 
                        EnemyLoot,
                        true,
                        Damage
                    );
                    
                    Placed = true;
                }
                
                Attempts++;
            }
        }
        
        return Content;
    }
    
    // Generate loot containers based on room depth
    static GenerateLoot(Content, Depth, Count = 2) {
        const R = 20;
        const C = 50;
        
        // Determine loot quality based on depth
        const ItemsPerChest = 1 + Math.floor(Depth / 4);
        
        for (let i = 0; i < Count; i++) {
            // Try to find an empty spot
            let Attempts = 0;
            let Placed = false;
            
            while (!Placed && Attempts < 20) {
                const r = Math.floor(Math.random() * (R-4)) + 2;
                const c = Math.floor(Math.random() * (C-4)) + 2;
                
                if (Content[r][c].Char === " ") {
                    // Get random items based on depth
                    const Items = GetRandomItemsByDepth(Depth, ItemsPerChest);
                    
                    // Create chest with different appearance based on quality
                    let ChestSymbol = "C";
                    let ChestColor = "gold";
                    let ChestName = "Treasure Chest";
                    
                    // Special chests for higher depths
                    if (Depth > 10 && Math.random() < 0.2) {
                        ChestSymbol = "C";
                        ChestColor = "cyan";
                        ChestName = "Magical Chest";
                    } else if (Depth > 5 && Math.random() < 0.3) {
                        ChestSymbol = "C";
                        ChestColor = "silver";
                        ChestName = "Silver Chest";
                    }
                    
                    Content[r][c] = new Container(
                        ChestSymbol, 
                        true, 
                        ChestColor, 
                        ChestName, 
                        Items
                    );
                    
                    Placed = true;
                }
                
                Attempts++;
            }
        }
        
        return Content;
    }
    
    // Generate room layout patterns
    static GenerateRoomLayout(Content, Type, Depth) {
        const R = 20;
        const C = 50;
        
        // Different layout patterns based on room type
        switch (Type) {
            case "fight":
                // More complex layouts for deeper levels
                if (Depth > 8) {
                    // Maze-like pattern
                    for (let r = 3; r < R-3; r += 3) {
                        for (let c = 3; c < C-3; c += 5) {
                            if (Math.random() < 0.7) {
                                // Create wall segments
                                for (let i = 0; i < 3; i++) {
                                    if (c + i < C-3) {
                                        Content[r][c + i] = new MapObject("#", true, "gray", "Wall");
                                    }
                                }
                            }
                            
                            if (Math.random() < 0.7) {
                                // Create vertical wall segments
                                for (let i = 0; i < 2; i++) {
                                    if (r + i < R-3) {
                                        Content[r + i][c] = new MapObject("#", true, "gray", "Wall");
                                    }
                                }
                            }
                        }
                    }
                } else if (Depth > 4) {
                    // Pillar pattern
                    for (let r = 5; r < R-5; r += 4) {
                        for (let c = 10; c < C-10; c += 10) {
                            Content[r][c] = new MapObject("#", true, "gray", "Pillar");
                            Content[r+1][c] = new MapObject("#", true, "gray", "Pillar");
                            Content[r][c+1] = new MapObject("#", true, "gray", "Pillar");
                            Content[r+1][c+1] = new MapObject("#", true, "gray", "Pillar");
                        }
                    }
                } else {
                    // Basic cover in corners for early levels
                    for (let i = 2; i < 5; i++) {
                        for (let j = 2; j < 5; j++) {
                            Content[i][j] = new MapObject("#", true, "gray", "Cover");
                            Content[i][C-j-1] = new MapObject("#", true, "gray", "Cover");
                            Content[R-i-1][j] = new MapObject("#", true, "gray", "Cover");
                            Content[R-i-1][C-j-1] = new MapObject("#", true, "gray", "Cover");
                        }
                    }
                }
                break;
                
            case "loot":
                // Different layouts based on depth
                if (Depth > 7) {
                    // Treasure vault with multiple chambers
                    // Central chamber
                    for (let r = 7; r < 13; r++) {
                        for (let c = 20; c < 30; c++) {
                            if (r === 7 || r === 12 || c === 20 || c === 29) {
                                Content[r][c] = new MapObject("#", true, "gold", "Ornate Wall");
                            }
                        }
                    }
                    
                    // Side chambers
                    for (let r = 4; r < 8; r++) {
                        for (let c = 10; c < 18; c++) {
                            if (r === 4 || r === 7 || c === 10 || c === 17) {
                                Content[r][c] = new MapObject("#", true, "silver", "Silver Wall");
                            }
                        }
                    }
                    
                    for (let r = 12; r < 16; r++) {
                        for (let c = 32; c < 40; c++) {
                            if (r === 12 || r === 15 || c === 32 || c === 39) {
                                Content[r][c] = new MapObject("#", true, "silver", "Silver Wall");
                            }
                        }
                    }
                    
                    // Doors between chambers
                    Content[9][20] = new MapObject("D", false, "gold", "Door");
                    Content[6][17] = new MapObject("D", false, "silver", "Door");
                    Content[13][32] = new MapObject("D", false, "silver", "Door");
                    
                } else if (Depth > 3) {
                    // Divided room with passages
                    for (let i = 3; i < R-3; i++) {
                        Content[i][15] = new MapObject("#", true, "white", "Wall");
                        Content[i][35] = new MapObject("#", true, "white", "Wall");
                    }
                    
                    // Create passages
                    Content[5][15] = new MapObject(" ", false, "white", "");
                    Content[15][35] = new MapObject(" ", false, "white", "");
                } else {
                    // Simple room with a few obstacles
                    for (let i = 5; i < 8; i++) {
                        for (let j = 15; j < 20; j++) {
                            Content[i][j] = new MapObject("#", true, "brown", "Crate");
                        }
                    }
                    
                    for (let i = 12; i < 15; i++) {
                        for (let j = 30; j < 35; j++) {
                            Content[i][j] = new MapObject("#", true, "brown", "Crate");
                        }
                    }
                }
                break;
                
            case "rest":
                // Different rest area layouts based on depth
                if (Depth > 6) {
                    // Elaborate sanctuary
                    // Central area
                    for (let r = 7; r < 13; r++) {
                        for (let c = 18; c < 32; c++) {
                            if (r === 7 || r === 12 || c === 18 || c === 31) {
                                Content[r][c] = new MapObject("#", true, "lightblue", "Sanctuary Wall");
                            }
                        }
                    }
                    
                    // Decorative elements
                    for (let c = 20; c < 30; c += 3) {
                        Content[7][c] = new MapObject("*", true, "gold", "Ornament");
                        Content[12][c] = new MapObject("*", true, "gold", "Ornament");
                    }
                    
                    for (let r = 8; r < 12; r += 2) {
                        Content[r][18] = new MapObject("*", true, "gold", "Ornament");
                        Content[r][31] = new MapObject("*", true, "gold", "Ornament");
                    }
                    
                    // Entrance
                    Content[10][18] = new MapObject(" ", false, "white", "");
                    
                    // Add healing fountain
                    Content[10][25] = new MapObject("O", true, "cyan", "Healing Fountain");
                    
                } else {
                    // Simple rest area
                    for (let i = 8; i < 13; i++) {
                        for (let j = 20; j < 31; j++) {
                            if (i === 8 || i === 12 || j === 20 || j === 30) {
                                Content[i][j] = new MapObject("#", true, "brown", "Wall");
                            }
                        }
                    }
                    
                    // Add entrance
                    Content[10][20] = new MapObject(" ", false, "white", "");
                    
                    // Add fireplace
                    Content[10][25] = new Container("F", true, "orange", "Fireplace", [ new Item("Coal", "C", 100000000, 2, {}, []) ]);
                    Content[10][25].Tick = function() {
                        if (this.Items.length == 0) {
                            this.Color = "darkred";
                            return;
                        }
                        const colors = ["firebrick", "red", "darkred", "orangered", "tomato", "coral", "lightcoral", "salmon", "darkorange", "orange", "gold", "yellow", "peachpuff", "mistyrose", "sandybrown", "peru", "chocolate", "saddlebrown", "brown", "maroon"];  
                        this.Color = colors[Math.floor(Math.random()*colors.length)];
                    };
                }
                break;
                
            case "boss":
                // Special layout for boss rooms
                // Central arena
                for (let r = 5; r < 15; r++) {
                    for (let c = 15; c < 35; c++) {
                        if ((r === 5 || r === 14) && c >= 15 && c <= 34) {
                            Content[r][c] = new MapObject("#", true, "darkred", "Arena Wall");
                        }
                        if ((c === 15 || c === 34) && r >= 5 && r <= 14) {
                            Content[r][c] = new MapObject("#", true, "darkred", "Arena Wall");
                        }
                    }
                }
                
                // Entrance
                Content[14][24] = new MapObject(" ", false, "white", "");
                Content[14][25] = new MapObject(" ", false, "white", "");
                Content[14][26] = new MapObject(" ", false, "white", "");

                // Decorative elements
                for (let c = 17; c <= 32; c += 5) {
                    Content[5][c] = new MapObject("^", false, "red", "Spike");
                }

                break;
                
            case "puzzle":
                // Puzzle room layout
                // Create a grid pattern
                for (let r = 5; r < 15; r += 3) {
                    for (let c = 10; c < 40; c++) {
                        Content[r][c] = new MapObject("-", false, "cyan", "Grid Line");
                    }
                }
                
                for (let c = 10; c < 40; c += 3) {
                    for (let r = 5; r < 15; r++) {
                        Content[r][c] = new MapObject("|", false, "cyan", "Grid Line");
                    }
                }
                
                // Add puzzle elements
                const PuzzleSymbols = ["?", "!", "*", "+", "="];
                for (let i = 0; i < 5; i++) {
                    const r = 6 + Math.floor(Math.random() * 7);
                    const c = 12 + Math.floor(Math.random() * 25);
                    if (Content[r][c].Char === " ") {
                        Content[r][c] = new MapObject(PuzzleSymbols[i], true, "yellow", "Puzzle Element");
                    }
                }
                break;
                
            default:
                // Default to a simple room with random obstacles
                this.GenerateObstacles(Content, 0.05);
        }
        
        return Content;
    }

    static GenerateRoomContent(Content, Room) {
        const Type = Room.Type;
        const Depth = Room.Depth || 1; // Default to depth 1 if not specified
        
        // Generate room layout based on type and depth
        Content = this.GenerateRoomLayout(Content, Type, Depth);
        
        // Add enemies for fight rooms
        if (Type === "fight") {
            // Scale number of enemies with depth
            const EnemyCount = 2 + Math.min(Math.floor(Depth / 2), 5);
            Content = this.GenerateEnemies(Content, Depth, EnemyCount);
        }
        
        // Add loot for loot rooms
        if (Type === "loot") {
            // Scale number of chests with depth
            const ChestCount = 1 + Math.min(Math.floor(Depth / 3), 3);
            Content = this.GenerateLoot(Content, Depth, ChestCount);
        }
        
        // Add healing items for rest rooms
        if (Type === "rest") {
            // Add healing chest
            const HealItems = [];
            
            // Scale healing potions with depth
            if (Depth <= 3) {
                HealItems.push(Consumables.MinorHealthPotion.Clone());
            } else if (Depth <= 7) {
                HealItems.push(Consumables.HealthPotion.Clone());
            } else {
                HealItems.push(Consumables.GreaterHealthPotion.Clone());
                
                // Add bonus items for deeper levels
                if (Depth > 10 && Math.random() < 0.5) {
                    HealItems.push(Consumables.ShieldPotion.Clone());
                }
            }

            if (Depth <= 1) {
                Content[11][21] = new Container("C", true, "lime", "StarterChest", [Weapons.RustySword.Clone(), Armor.LeatherArmor.Clone(), Weapons.WoodenBow.Clone()]);
            } else {
                Content[9][29] = new MapObject("M", true, "yellow", "Merchant [Sell]");
    
                Content[9][29].Interact = function() {
                    let ContainerOverlay = new Overlay(
                        3, 
                        12,
                        OverlayHelper.GenerateBox(6, 44, this.Name, "[SELECT] To Sell"),
                        window.Game.Player.Inventory.length, 
    
                        function() {
                            ContainerOverlay.Content = OverlayHelper.GenerateBox(6, 44, this.Name, "[SELECT] To Sell");
                            const Selection = window.Game.Player.OverlaySelection;
    
                            let Offset = Selection > 1 ? Selection-2 : 0;
    
                            for (const [Index, Itm] of window.Game.Player.Inventory.slice(0+Offset,4+Offset).entries()) {
                                const Selected = (window.Game.Player.Inventory.indexOf(Itm) == Selection);
                                const Prefix = Selected ? '*' : '';
                                const Color = Selected ? "coral" : "";
    
                                OverlayHelper.WriteToOverlay(ContainerOverlay, `${Prefix}${Itm.Name} ${Itm.Worth}₡`, 2, Index+1, Color);
                            }
    
                            if (window.Game.Player.Inventory.length == 0) {
                                OverlayHelper.WriteToOverlay(ContainerOverlay, "Inventory Empty", 2, 1, "goldenrod");
                            }
                        }.bind(this),
    
                        function() {
                            const Selection = window.Game.Player.OverlaySelection;
                            const Item = window.Game.Player.Inventory[Selection];
    
                            if (Item && Item.Metadata && Item.Metadata.RoomID) {
                                return;
                            }
    
                            window.Game.Player.Money += Item.Worth;
                            Item.RemoveFromInventory();
                            ContainerOverlay.SelectCount = window.Game.Player.Inventory.length;
                        }.bind(this)
                    );
    
                    window.Game.Player.OverlaySelection = 0;
                    window.Game.ActiveOverlay = ContainerOverlay;
                }
    
                Content[11][29] = new MapObject("M", true, "aqua", "Merchant [Buy]");
    
                let MerchantItems = GetRandomItemsByDepth(Depth, Math.round(Math.random()*5))
    
                Content[11][29].Interact = function() {
                    let ContainerOverlay = new Overlay(
                        3,
                        12,
                        OverlayHelper.GenerateBox(6, 44, this.Name, "[SELECT] To Buy"),
                        MerchantItems.length, 
    
                        function() {
                            ContainerOverlay.Content = OverlayHelper.GenerateBox(6, 44, this.Name, "[SELECT] To Buy");
                            const Selection = window.Game.Player.OverlaySelection;
    
                            let Offset = Selection > 1 ? Selection-2 : 0;
    
                            for (const [Index, Itm] of MerchantItems.slice(0+Offset,4+Offset).entries()) {
                                const Selected = (MerchantItems.indexOf(Itm) == Selection);
                                const Prefix = Selected ? '*' : '';
                                const Color = Selected ? "coral" : "";
    
                                OverlayHelper.WriteToOverlay(ContainerOverlay, `${Prefix}${Itm.Name} ${Itm.Worth}₡`, 2, Index+1, Color);
                            }
    
                            if (MerchantItems.length == 0) {
                                OverlayHelper.WriteToOverlay(ContainerOverlay, "Merchant Sold Out", 2, 1, "goldenrod");
                            }
                        }.bind(this),
    
                        function() {
                            const Selection = window.Game.Player.OverlaySelection;
                            const Item = MerchantItems[Selection];
    
                            if (!(window.Game.Player.Money >= Item.Worth)) return;
    
                            window.Game.Player.Money -= Item.Worth;
                            MerchantItems.splice(MerchantItems.indexOf(Item), 1);
                            window.Game.Player.Inventory.push(Item);
    
                            ContainerOverlay.SelectCount = MerchantItems.length;
                        }.bind(this)
                    );
    
                    window.Game.Player.OverlaySelection = 0;
                    window.Game.ActiveOverlay = ContainerOverlay;
                }
            }
            
            Content[9][21] = new Container("H", true, "green", "Health Chest", HealItems);
        }
        
        // Add boss for boss rooms
        if (Type === "boss") {
            // Create a boss with scaled difficulty
            const BossHealth = 30 + (Depth * 5);
            const BossDamage = 3 + Math.floor(Depth * 0.8);
            
            // Boss names based on depth
            const BossNames = [
                "Dungeon Guardian",
                "Corrupted Warrior",
                "Shadow Fiend",
                "Chaos Elemental",
                "Ancient Construct",
                "Void Harbinger",
                "Elder Dragon",
                "Dimensional Horror"
            ];
            
            const BossIndex = Math.min(Math.floor(Depth / 2), BossNames.length - 1);
            const BossName = BossNames[BossIndex];
            
            // Add special loot for defeating the boss
            const SpecialLoot = GetRandomItemsByDepth(Depth + 2, 2); // Better loot than normal
            // Place boss on the platform

            Content[8][25] = new Entity("Ω", true, "crimson", BossName, BossHealth, SpecialLoot, true, BossDamage);
            
            // Add minions for higher level bosses
            if (Depth > 5) {
                const MinionCount = Math.min(Math.floor(Depth / 3), 4);
                for (let i = 0; i < MinionCount; i++) {
                    const r = 10 + Math.floor(Math.random() * 3);
                    const c = 20 + Math.floor(Math.random() * 10);
                    
                    if (Content[r][c].Char === " ") {
                        Content[r][c] = new Entity("m", true, "red", "Minion", Math.floor(BossHealth / 4), [], true, Math.floor(BossDamage/2));
                    }
                }
            }
        }
        
        return Content;
    }

    static GenerateRoom(Room, Rooms) {
        let Content = this.BlankRoom();
        
        // Set depth if not already set
        if (!Room.Depth) {
            // Calculate depth based on distance from start
            let CurrentRoom = Room;
            let Depth = 1;
            
            while (CurrentRoom.Parent !== undefined) {
                Depth++;
                CurrentRoom = Rooms[CurrentRoom.Parent];
            }
            
            Room.Depth = Depth;
        }

        // KEYS
        let KeyLocations = [];
        for (const Key of Room.Keys) {
            // More randomized key placement
            const KLX = Math.floor(Math.random() * (47 - 2 + 1)) + 2;
            const KLY = Math.floor(Math.random() * (17 - 2 + 1)) + 2;
            
            // Create key with visual indicator of which door it unlocks
            const KeyItem = new Item(`Key - Door ${Key}`, "k", 0, 0, { 
                RoomID: Key,
                Description: `A key that unlocks door ${Key}`
            });
            
            // Different chest appearance based on depth
            let ChestSymbol = "C";
            let ChestColor = "violet";
            
            if (Room.Depth > 8) {
                ChestSymbol = "C";
                ChestColor = "cyan";
            } else if (Room.Depth > 4) {
                ChestSymbol = "C";
                ChestColor = "silver";
            }
            
            Content[KLY][KLX] = new Container(ChestSymbol, true, ChestColor, "Key Chest", [KeyItem]);
        }

        // DOORS
        for (const [Index, Child] of Room.Children.entries()) {
            const ChildString = String(Child).padStart(2, '0');
            const ChildRoom = Rooms[Child];
            
            let Objs = [];
            for (let x = 0; x < 2; x++) {
                // Get room type for door appearance
                const TypeCode = ChildRoom.Type[0].toUpperCase();
                
                // Door colors based on room type
                const Color = {
                    "F": "firebrick",  // Fight
                    "L": "gold",       // Loot
                    "R": "lightgreen", // Rest
                    "B": "crimson",    // Boss
                    "P": "cyan"        // Puzzle
                }[TypeCode] || "white";

                let EntranceObject = new MapObject(ChildString[x], true, Color, `Door ${Child}${TypeCode}`);
                Objs.push(EntranceObject);
                EntranceObject.Subtext = "Locked";
                EntranceObject.Unlocked = false;
    
                EntranceObject.Interact = function(Item) {
                    if (this.Unlocked) {
                        window.Game.SwitchRooms(Child);
                        return;
                    }
    
                    for (const Itm of window.Game.Player.Inventory) {
                        if (!(Itm.Metadata["RoomID"] == Child)) continue;

                        ChildRoom.Unlocked = true;
    
                        window.Game.Player.Inventory = window.Game.Player.Inventory.filter(function(ItmFilter) {
                            return !(ItmFilter.Metadata["RoomID"] == Child);
                        });

                        for (const Obj of Objs) {
                            Obj.Subtext = "Unlocked";
                            Obj.Color = "limegreen";
                            Obj.Unlocked = true;
                        }
                    }
                };
    
                // Door placement - more varied based on number of children
                if (Index == 0) {
                    Content[0][24+x] = EntranceObject;
                } else if (Index == 1) {
                    Content[9+x][49] = EntranceObject;
                }
            }
        }

        // EXITS
        if (Room.Parent !== undefined) {
            const ParentRoom = Rooms[Room.Parent];
            const ParentType = ParentRoom ? ParentRoom.Type[0].toUpperCase() : "E";
            
            // Exit color based on parent room type
            const ExitColor = {
                "F": "firebrick",
                "L": "gold",
                "R": "lightgreen",
                "B": "crimson",
                "P": "cyan"
            }[ParentType] || "chocolate";
            
            let ExitObject = new MapObject("E", true, ExitColor, `Exit - Door ${Room.Parent}`);

            ExitObject.Interact = function(Itm) {
                window.Game.SwitchRooms(Room.Parent);
                return;
            };

            Content[9][0] = ExitObject;
            Content[10][0] = ExitObject;
        }

        // Generate room content based on type and depth
        Content = this.GenerateRoomContent(Content, Room);

        //Content[1][2] = new Projectile(">", "red", 100);

        return new Map(Content);
    }
}

export class MapGenerator {
    static Rooms = [];

    static MaxBranchesPerRoom = 2;
    static MaxKeysPerRoom = 2;

    static GetRandomElement(list) {
        const randomIndex = Math.floor(Math.random() * list.length);
        return list[randomIndex];
    }

    static GetRandomParent() {
        let FilteredRooms = this.Rooms.filter(function(Rm) {
            return Rm.Children.length < this.MaxBranchesPerRoom;
        }.bind(this));

        return this.GetRandomElement(FilteredRooms);
    }

    static GetRandomKeyLocation() {
        let FilteredRooms = this.Rooms.filter(function(Rm) {
            return Rm.Keys.length < this.MaxKeysPerRoom;
        }.bind(this));

        return this.GetRandomElement(FilteredRooms);
    }

    static GenerateRooms(Length) {
        this.Rooms = [];
        const StartingRoom = new Room(0, "rest", undefined);
        StartingRoom.Unlocked = true;
        this.Rooms.push(StartingRoom);

        for (let x=0; x<Length; x++) {
            const Parent = this.GetRandomParent();
            const KeyLocation = this.GetRandomKeyLocation();

            let Type = ["fight", "loot", "rest"][Math.floor(Math.random()*3)];
            if ( ((x+1) % 5 == 0 || x==Length-1) && !(Length-x < 5 && !x==Length-1) ) Type = "boss";

            const NewRoom = new Room(x+1, Type, Parent.RoomID);
            Parent.AddChild(NewRoom.RoomID);
            KeyLocation.AddKey(NewRoom.RoomID);

            this.Rooms.push(NewRoom);
        }
        
        return this.Rooms;
    }
}