import { DisplayManager, Overlay } from "/static/js/Display.js";
import { OverlayHelper } from "/static/js/OverlayHelper.js";
import { MapObject, DisplayObject } from "/static/js/Object.js";
import { MapGenerator, RoomGenerator } from "/static/js/MapGenerator.js";
import { Player } from "/static/js/Player.js";
import { sleep, RoomVisualizer, WaitForKey } from "/static/js/Utils.js";

export class Game {
    static Display = new DisplayManager(20, 50);
    static Player = new Player(1, 1);
    static Rooms = MapGenerator.GenerateRooms(50);
    static GeneratedRooms;
    static CurrentRoom;
    static Map;

    static LastAttack = 0;

    static SelectedMapObject;
    static SelectedMapObjectXY = {X:0, Y:0};

    static ActiveOverlay;
    static StandbyOverlay;

    static DungeonMapDisplay;

    static Ticks = 0;
    static TickRate = 5;
    static EntityTickRate = 25;

    static Controls = {
        MOVE_UP: ["i", "w"],
        MOVE_DOWN: ["k", "s"],
        MOVE_LEFT: ["j", "a"],
        MOVE_RIGHT: ["l", "d"],

        CYCLE_SELECTION: ["n"],
        CYCLE_UP: ["ArrowUp"],
        CYCLE_DOWN: ["ArrowDown"],
        
        ATTACK: ["."],
        SELECT: ["Enter"],
        USE: [";"],
        INSPECT: ["'"],
        
        OPEN_INVENTORY: ["m"],
        CLOSE_ALL: ["Escape", ","],

        SHOW_MAP: ["p"]
    }

    static PressedKeys = new Set(); 

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

    static SetMapSelection(Sel) {
        this.Player.Selection = Sel;
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

    static CycleOverlaySelection(Increment) {
        this.Player.OverlaySelection += Increment ? Increment : 1;

        this.UpdateOverlaySelection();
    }

    static async HandleInput(Key) {
        try {
        const Control = this.GetKeybind(Key);

        switch (Control) {
            case "MOVE_UP":
                this.MovePlayer(0, -1);
                this.SetMapSelection(0);
                break;
            case "MOVE_DOWN":
                this.MovePlayer(0, 1);
                this.SetMapSelection(4);
                break;
            case "MOVE_LEFT":
                this.MovePlayer(-1, 0);
                this.SetMapSelection(6);
                break;
            case "MOVE_RIGHT":
                this.MovePlayer(1, 0);
                this.SetMapSelection(2);
                break;
            case "CYCLE_SELECTION":
                if (this.ActiveOverlay) {
                    this.CycleOverlaySelection();
                }
                break;
            case "CYCLE_UP":
                if (this.ActiveOverlay) {
                    this.CycleOverlaySelection(-1);
                }
                break;
            case "CYCLE_DOWN":
                if (this.ActiveOverlay) {
                    this.CycleOverlaySelection();
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
            case "USE":
                if (this.ActiveOverlay && this.ActiveOverlay.UseFunction && this.ActiveOverlay.SelectCount > 0) this.ActiveOverlay.UseFunction();
                break;
            case "ATTACK":
                if ( (Date.now() - this.LastAttack) < this.Player.GetCooldown()) break;
                if (!this.Player.EquippedItem) break;

                const Surrounding = [
                    [ 0, -1],
                    [ 1,  1],
                    [ 1,  0],
                    [ 1,  1],
                    [ 0,  1],
                    [-1,  1],
                    [-1,  0],
                    [-1, -1],
                ]

                for (const Coords of Surrounding) {
                    const CX = Coords[0];
                    const CY = Coords[1];

                    const X = this.Player.PositionX+CX;
                    const Y = this.Player.PositionY+CY;

                    if (X<0 || X>49) continue;
                    if (Y<0 || Y>19) continue;

                    const Sel = this.Map.GetObj(X, Y);

                    if (!Sel) continue;
                    if (!Sel.Attack) continue;

                    Sel.Attack(this.Player.GetDamage());

                    this.Display.HighlightMap(X, Y, "red");
                }

                this.LastAttack = Date.now();

                break;
            case "INSPECT":
                if (this.ActiveOverlay && this.ActiveOverlay.InspectFunction) {
                    this.ActiveOverlay.InspectFunction();
                }
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

        const PlayerStr = `[${this.Player.Health}HP] [${this.Player.Money}₡]`;

        this.StandbyOverlay = new Overlay(0, 19, OverlayHelper.GenerateBlank(1, 50));
        OverlayHelper.WriteToOverlay(this.StandbyOverlay, `${PlayerStr}${EquippedStr}${SelStr}`, 0, 0);
    }

    static UpdateMap() {
        for (const [Y, Row] of this.Map.GetObjects().entries()) {
            for (const [X, Obj] of Row.entries()) {
                if (Obj.ReplaceWith) this.Map.GetObjects()[Y][X] = Obj.ReplaceWith;
                if (Obj.MoveTo) {
                    let NewX = Obj.MoveTo[0];
                    let NewY = Obj.MoveTo[1];

                    if (this.Map.GetObj(NewX, NewY).Collision == false) {
                        this.Map.SetObj(X, Y, new MapObject(" ", false));
                        this.Map.SetObj(NewX, NewY, Obj);
                    };
                };
                if (Obj.Tick && (this.Ticks % this.TickRate == 0)) Obj.Tick(X, Y);
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

    static async KeyPressed(E) {
        this.HandleInput(E.key);
    }
    
    static async Setup() {
        $(document).keydown(this.KeyPressed.bind(this));
        this.GenerateRooms();
        this.MovePlayer(0, 0);
        
        while (true) {
            this.Ticks++;

            if (this.Ticks % 500 == 0 && this.Player.Health > 100) {
                this.Player.Health -= Math.ceil((this.Player.Health-100)/2);
                if (this.Player.Health < 100) {
                    this.Player.Health = 100;
                }
            }

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
            if (localStorage.getItem("warning_set") != "1") {
                this.Display.DisplayRaw([[new DisplayObject("WARNING: THIS GAME HAS A VERY STEEP LEARNING CURVE.")], [new DisplayObject("REMEMBER: THE GAME IS IN BETA AND BUGS MAY OCCUR.")], [new DisplayObject("SOME FEATURES ARE NOT FULLY IMPLEMENTED AND UNEXPECTED BEHAVIORS MAY OCCUR.")], [new DisplayObject("PLEASE CONTACT THE DEVELOPER (MATTHEW CARMICHAEL) VIA EMAIL IF BUGS OCCUR.")], [new DisplayObject("(PLEASE PROVIDE SCREENSHOTS OR ERROR MESSAGES)")], [new DisplayObject("PRESS ANY KEY TO CONTINUE")]]);
                localStorage.setItem("warning_set", "1");
                await WaitForKey();
            }

            await this.Setup();
        } catch (e) {
            document.body.innerHTML = `${e.stack.toString()}`;
        }
    }
}

// WRITTEN BY MATTHEW CARMICHAEL, 2025