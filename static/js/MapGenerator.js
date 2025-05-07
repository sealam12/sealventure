import { DisplayManager } from "/static/js/Display.js";

export class Room {
    constructor(RoomID, Parent) {
        this.RoomID = RoomID;
        this.Children = [];
        this.Keys = [];
        this.Parent = Parent;
    }

    AddKey(Key) {
        this.Keys.push(Key);
    }

    AddChild(Child) {
        this.Children.push(Child);
    }
}

export class MapGenerator {
    static Display = new DisplayManager(20,50);
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
        const StartingRoom = new Room(0, undefined);
        this.Rooms.push(StartingRoom);

        for (let x=0; x<Length; x++) {
            const Parent = this.GetRandomParent();
            const KeyLocation = this.GetRandomKeyLocation();

            const NewRoom = new Room(x+1, Parent.RoomID);
            Parent.AddChild(NewRoom.RoomID);
            KeyLocation.AddKey(NewRoom.RoomID);

            this.Rooms.push(NewRoom);
        }
        
        return this.Rooms;
    }
}