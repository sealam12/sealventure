import { sleep } from "/static/js/Utils.js";
import { DisplayObject } from "/static/js/Object.js";

export class Overlay {
    constructor(StartX, StartY, Content, SelectCount, TickFunction, SelectFunction) {
        this.StartX = StartX;
        this.StartY = StartY;
        this.Content = Content;
        this.SelectCount = SelectCount;
        this.TickFunction = TickFunction;
        this.SelectFunction = SelectFunction;
    }
}

export class DisplayManager {
    constructor(Rows, Columns) {
        this.Screen = $("#main-display");
        
        this.Rows = Rows;
        this.Columns = Columns;
        this.MapObjects = [];
        this.OverlayObjects = [];
    }

    Blank() {
        let Objs = [];
        for (let y=0; y<this.Rows; y++) {
            Objs.push([]);
            
            for (let x=0; x<this.Columns; x++) {
                const O = new DisplayObject(" ");
                O.Blank = true;
                Objs[y].push(O);
            }
        }

        return Objs;
    }

    ResetScreen() {
        this.OverlayObjects = this.Blank();
        this.MapObjects = [];
    }

    DisplayMap(Map) {
        const Objects = Map.Objects;
        let NewObjects = [];

        for (const [Index1, Row] of Objects.entries()) {
            NewObjects.push([]);
            for (const [Index2, Column] of Row.entries()) {
                NewObjects[Index1].push(new DisplayObject(Column.Char, Column.Color))
            }
        }

        this.MapObjects = NewObjects;
    }

    DisplayOverlay(Overlay) {
        let NewObjects = this.OverlayObjects;

        for (const [Y, Row] of Overlay.Content.entries()) {
            for (const [X, OverlayObject] of Row.entries()) {
                NewObjects[Y+Overlay.StartY][X+Overlay.StartX] = OverlayObject;
            }
        }

        this.OverlayObjects = NewObjects;
    }

    DisplayAll() {
        let DisplayObjects = this.MapObjects;
        for (const [Y, Row] of this.OverlayObjects.entries()) {
            for (const [X, OverlayObject] of Row.entries()) {
                if (OverlayObject.Blank) { continue; }
                DisplayObjects[Y][X] = OverlayObject;
            }
        }

        let ScreenText = "";
        for (const Row of DisplayObjects) {
            for (const DispObj of Row) {
                ScreenText += DispObj.GetCharText();
            }

            ScreenText += "<br>"
        }

        this.Screen.html(ScreenText);
    }

    HighlightMap(X, Y, Color) {
        this.MapObjects[Y][X].Color = Color;

        if (this.MapObjects[Y][X].Char == " ") {
            this.MapObjects[Y][X].Char = "*"
        }
    }

    async Tick() {
        this.DisplayContent();
    }
}