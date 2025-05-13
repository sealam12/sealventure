import { MapObject, Item, Container, Entity } from "/static/js/Object.js";
import { Map } from "/static/js/Map.js";
import { Items, Tiers } from "/static/js/Items.js";

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

        const R=20;
        const C=50;

        for (let r=0; r<R; r++) {
            Content.push([]);
            for (let c=0; c<C; c++) {
                if (r == 0 || r == R-1 || c==0 || c==C-1) {
                    Content[r].push(new MapObject("#", true, "white", "Wall"));
                } else {
                    Content[r].push(new MapObject(" ", false, "white", ""));
                }
            }
        }

        return Content;
    }

    static GenerateRoomContent(Content, Room, Zones) {
        const Type = Room.Type;

        if (Type == "attack") {
            
        }

        return Content;
    }

    static GenerateRoom(Room, Rooms) {
        let Content = this.BlankRoom();

        // KEYS

        let KeyLocations = [];
        for (const Key of Room.Keys) {
            const KLX = Math.floor(Math.random() * (47 - 2 + 1)) + 2;
            const KLY = Math.floor(Math.random() * (17 - 2 + 1)) + 2;
            const KeyItem = new Item(`Key - Door ${Key}`, "k", 0, { RoomID: Key });
            Content[KLY][KLX] = new Container("C", true, "gold", "Key Chest", [ KeyItem ]);
        }

        // DOORS

        for (const [Index, Child] of Room.Children.entries()) {
            const ChildString = String(Child).padStart(2, '0');

            let Objs = [];
            for (let x=0; x<2; x++) {
                const TypeCode = Rooms[Child].Type[0].toUpperCase();
                const Color = {
                    "F": "firebrick",
                    "L": "gold",
                    "R": "lightgreen",
                }[TypeCode];

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
                        if ( !(Itm.Metadata["RoomID"] == Child) ) continue;

                        Rooms[Child].Unlocked = true;
    
                        window.Game.Player.Inventory = window.Game.Player.Inventory.filter(function(ItmFilter) {
                            return !(ItmFilter.Metadata["RoomID"] == Child);
                        })

                        for (const Obj of Objs) {
                            Obj.Subtext = "Unlocked";
                            Obj.Color = "limegreen";
                            Obj.Unlocked = true;
                        }
    
                    }
                }
    
                if (Room.Children.length == 1) {
                    Content[9+x][49] = EntranceObject;
                } else {
                    const Y = (Index==0) ? 0 : 19;
                    Content[Y][24+x] = EntranceObject;
                }

            }
        }

        // EXITS

        if (Room.Parent != undefined) {
            let ExitObject = new MapObject("E", true, "chocolate", `Exit - Door ${Room.Parent}`);

            ExitObject.Interact = function(Itm) {
                window.Game.SwitchRooms(Room.Parent);
                return;
            }

            Content[9][0] = ExitObject;
            Content[10][0] = ExitObject;
        }

        Content = this.GenerateRoomContent(Content, Room);

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
        this.Rooms.push(StartingRoom);

        for (let x=0; x<Length; x++) {
            const Parent = this.GetRandomParent();
            const KeyLocation = this.GetRandomKeyLocation();

            const Type = ["fight", "loot", "rest"][Math.floor(Math.random()*3)]

            const NewRoom = new Room(x+1, Type, Parent.RoomID);
            Parent.AddChild(NewRoom.RoomID);
            KeyLocation.AddKey(NewRoom.RoomID);

            this.Rooms.push(NewRoom);
        }
        
        return this.Rooms;
    }
}