import { DisplayManager, Overlay } from "/static/js/Display.js";
import { OverlayHelper } from "/static/js/OverlayHelper.js";
import { MapObject, DisplayObject } from "/static/js/Object.js";
import { GenerateSampleMap } from "/static/js/Map.js";
import { Player } from "/static/js/Player.js";
import { sleep } from "/static/js/Utils.js";

export class Game {
    static Display = new DisplayManager(20, 50);
    static Player = new Player(1, 1);
    static Map = GenerateSampleMap(20, 50);

    static SelectedMapObject;
    static SelectedMapObjectXY = {X:0, Y:0};

    static ActiveOverlay;

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
                    Sel.Interact();
                }

                break;
            case "CLOSE_ALL":
                this.ActiveOverlay = undefined;
                break;
        }
    }

    static async Setup() {
        $(document).keydown(this.HandleInput.bind(this));
        this.MovePlayer(0, 0);

        while (true) {
            this.Display.DisplayMap(this.Map);

            if (this.ActiveOverlay) {
                if (this.ActiveOverlay.TickFunction) this.ActiveOverlay.TickFunction();
                this.UpdateOverlaySelection();

                this.Display.DisplayOverlay(this.ActiveOverlay);
            } else {
                this.Display.DisplayOverlay(new Overlay(0, 0, []));   
            }

            this.UpdateMapSelection();

            const Sel = this.SelectedMapObjectXY;
            this.Display.HighlightMap(Sel.X, Sel.Y, "mediumturquoise");

            this.Display.DisplayAll();
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