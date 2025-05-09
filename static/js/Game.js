import { DisplayManager, Overlay } from "/static/js/Display.js";
import { OverlayHelper } from "/static/js/OverlayHelper.js";
import { MapObject, DisplayObject } from "/static/js/Object.js";
import { MapGenerator, RoomGenerator } from "/static/js/MapGenerator.js";
import { Player } from "/static/js/Player.js";
import { sleep, RoomVisualizer } from "/static/js/Utils.js";

export class Game {
    static Display = new DisplayManager(20, 50);
    static Player = new Player(1, 1);
    static Rooms = MapGenerator.GenerateRooms(23);
    static GeneratedRooms;
    static CurrentRoom;
    static Map;

    static AttackCooldown = 400;
    static LastAttack = 0;

    static SelectedMapObject;
    static SelectedMapObjectXY = {X:0, Y:0};

    static ActiveOverlay;
    static StandbyOverlay;

    static DungeonMapDisplay;

    static Controls = {
        MOVE_UP: ["i"],
        MOVE_DOWN: ["k"],
        MOVE_LEFT: ["j"],
        MOVE_RIGHT: ["l"],

        CYCLE_SELECTION: ["n"],
        
        ATTACK: ["."],
        SELECT: ["Enter"],
        
        OPEN_INVENTORY: ["m"],
        CLOSE_ALL: ["Escape", ","],

        SHOW_MAP: ["p"]
    }

    static GetKeybind(Key) {
        for (const [Keybind, Value] of Object.entries(this.Controls)) {
            if (Value.indexOf(Key) > -1) return Keybind;
        }

        return undefined;
    }

    static MovePlayer(X, Y) {
        const NewX = this.Player.PositionX + X;
        const NewY = this.Player.PositionY + Y;

        const ObjectAt = this.Map.GetObj(NewX, NewY);
        if (ObjectAt.Collision) return;

        this.Map.SetObj(this.Player.PositionX, this.Player.PositionY, new MapObject(" ", false));
        this.Player.PositionX = NewX;
        this.Player.PositionY = NewY;
        this.Map.SetObj(NewX, NewY, new MapObject("@", true, "palegreen"));
    }

    static SetPlayerPosition(X, Y) {
        const ObjectAt = this.Map.GetObj(X, Y);
        if (ObjectAt.Collision) return;

        this.Map.SetObj(this.Player.PositionX, this.Player.PositionY, new MapObject(" ", false));
        this.Player.PositionX = X;
        this.Player.PositionY = Y;
        this.Map.SetObj(X, Y, new MapObject("@", true, "palegreen"));
    }

    static UpdateMapSelection() {
        const XY = this.Player.GetSelectedXY();
        this.SelectedMapObjectXY = XY;
        this.SelectedMapObject = this.Map.GetObj(XY.X, XY.Y);
    }

    static CycleMapSelection() {
        this.Player.Selection += 1;
        if (this.Player.Selection > 7) this.Player.Selection = 0;
        if (this.Player.Selection < 0) this.Player.Selection = 7;

        this.UpdateMapSelection();
    }

    static UpdateOverlaySelection() {
        if (!this.ActiveOverlay) return;
        if (this.Player.OverlaySelection > this.ActiveOverlay.SelectCount-1) this.Player.OverlaySelection = 0;
        if (this.Player.OverlaySelection < 0) this.Player.OverlaySelection = this.ActiveOverlay.SelectCount-1;

        if (this.ActiveOverlay.SelectCount == 0) {
            this.Player.OverlaySelection = 0;
            return;
        }
    }

    static CycleOverlaySelection() {
        this.Player.OverlaySelection += 1;

        this.UpdateOverlaySelection();
    }

    static async HandleInput(Event) {
        try {
        const Key = Event.key;
        const Control = this.GetKeybind(Key);

        switch (Control) {
            case "MOVE_UP":
                this.MovePlayer(0, -1);
                break;
            case "MOVE_DOWN":
                this.MovePlayer(0, 1);
                break;
            case "MOVE_LEFT":
                this.MovePlayer(-1, 0);
                break;
            case "MOVE_RIGHT":
                this.MovePlayer(1, 0);
                break;
            case "CYCLE_SELECTION":
                if (this.ActiveOverlay) {
                    this.CycleOverlaySelection();
                } else {
                    this.CycleMapSelection();
                }
                break;
            case "OPEN_INVENTORY":
                this.Player.InventoryOverlay();
                break;
            case "SELECT":
                if (this.ActiveOverlay && this.ActiveOverlay.SelectFunction && this.ActiveOverlay.SelectCount > 0) {
                    this.ActiveOverlay.SelectFunction();
                } else {
                    const Sel = this.SelectedMapObject;
                    if (!Sel) break;
                    Sel.Interact(this.Player.EquippedItem);
                }

                break;
            case "ATTACK":
                const Sel = this.SelectedMapObject;
                
                if (!Sel) break;
                if (!Sel.Attack) break;
                if (!this.Player.EquippedItem) break;

                if ( (Date.now() - this.LastAttack) < this.AttackCooldown) break;

                Sel.Attack(this.Player.EquippedItem);
                this.LastAttack = Date.now();

                break;
            case "SHOW_MAP":
                this.DungeonMapDisplay = true;
                break;
            case "CLOSE_ALL":
                this.DungeonMapDisplay = false;
                this.ActiveOverlay = undefined;
                break;
        }

        } catch (e) {
            document.body.innerHTML = e.stack.toString();
        }
    }

    static UpdateStandbyOverlay() {
        let EquippedStr = this.Player.EquippedItem ? `[E: ${this.Player.EquippedItem.Name}] ` : "[E: NONE] ";
        let SelStr = this.SelectedMapObject ? `[${this.SelectedMapObject.Name}` : "[NONE";

        if (this.SelectedMapObject && this.SelectedMapObject.Health) {
            SelStr += ` (${this.SelectedMapObject.Health}HP)`;
        }

        if (this.SelectedMapObject && this.SelectedMapObject.Subtext) {
            SelStr += ` - ${this.SelectedMapObject.Subtext}`;
        }

        SelStr += "]";

        this.StandbyOverlay = new Overlay(0, 19, OverlayHelper.GenerateBlank(1, 50));
        OverlayHelper.WriteToOverlay(this.StandbyOverlay, `${EquippedStr}${SelStr}`, 0, 0);
    }

    static UpdateMap() {
        for (const [Y, Row] of this.Map.GetObjects().entries()) {
            for (const [X, Obj] of Row.entries()) {
                if (Obj.ReplaceWith) this.Map.GetObjects()[Y][X] = Obj.ReplaceWith;
                if (Obj.Tick) Obj.Tick();
            }
        }
    }

    static SwitchRooms(NewRoomID) {
        const NewMap = this.GeneratedRooms[NewRoomID];
        if (!NewMap) { return; }

        this.SetPlayerPosition(1, 9);
        this.Map = NewMap;
        this.MovePlayer(0,0);

        this.CurrentRoom = NewRoomID;
    }

    static GenerateRooms() {
        let GeneratedRooms = [];
        for (const Rm of this.Rooms) {
            GeneratedRooms.push(RoomGenerator.GenerateRoom(Rm, this.Rooms));
        }

        this.GeneratedRooms = GeneratedRooms;
        this.Map = this.GeneratedRooms[0];
        this.CurrentRoom = 0;
    }
    
    static async Setup() {
        $(document).keydown(this.HandleInput.bind(this));
        this.GenerateRooms();
        this.MovePlayer(0, 0);
        
        while (true) {
            this.Display.ResetScreen();
            this.Display.DisplayMap(this.Map);

            if (this.ActiveOverlay) {
                this.UpdateOverlaySelection();
                if (this.ActiveOverlay.TickFunction) this.ActiveOverlay.TickFunction();
                this.Display.DisplayOverlay(this.ActiveOverlay);
            } else {
                this.Display.DisplayOverlay(new Overlay(0, 0, []));   
            }

            this.UpdateMap();

            this.UpdateStandbyOverlay();

            this.Display.DisplayOverlay(this.StandbyOverlay);
            this.UpdateMapSelection();

            const Sel = this.SelectedMapObjectXY;
            this.Display.HighlightMap(Sel.X, Sel.Y, "mediumturquoise");

            if (this.DungeonMapDisplay) {
                this.Display.DisplayRaw(RoomVisualizer.Visualize(this.Rooms));
            } else {
                this.Display.DisplayAll();
            }
            await sleep(1);
        }
    }

    static async Main() {
        try {
            await this.Setup();
        } catch (e) {
            document.body.innerHTML = `${e.stack.toString()}`;
        }
    }
}

// WRITTEN BY MATTHEW CARMICHAEL, 2025