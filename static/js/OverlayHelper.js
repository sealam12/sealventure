import { DisplayObject } from "/static/js/Object.js";

export class OverlayHelper {
    static GenerateBlank(Rows, Columns) {
        const R=Rows;
        const C=Columns;

        let Content = [];
        for (let r=0; r<R; r++) {
            Content.push([]);
            for (let c=0; c<C; c++) {
                let NewObj = new DisplayObject(" ", "default");
                NewObj.Blank = true;
                Content[r].push(NewObj);
            }
        } 

        return Content;
    }
    static GenerateBox(Rows, Columns, TitleText, SubText, OutlineChar) {
        const R=Rows;
        const C=Columns;
        let Content = [];
        
        for (let r=0; r<R; r++) {
            Content.push([]);
            for (let c=0; c<C; c++) {
                if (OutlineChar) {
                    if (r == 0 || r == R-1 || c==0 || c==C-1) {
                        Content[r].push(new DisplayObject(OutlineChar, "default"));
                    } else {
                        Content[r].push(new DisplayObject(" ", "default"));
                    }
                } else {
                    if ( (r == 0 || r == R-1) && !(c==0 || c==C-1) ) {
                        if (TitleText && TitleText[c-3] && r==0) {
                            Content[r].push(new DisplayObject(TitleText[c-3], "default"));
                        } else if (TitleText && (TitleText[c-2] || TitleText.length+3 == c) && r==0) {
                            Content[r].push(new DisplayObject(" ", "default"));
                        } else if (SubText && SubText[c-3] && r==R-1) {
                            Content[r].push(new DisplayObject(SubText[c-3], "default"));
                        } else if (SubText && (SubText[c-2] || SubText.length+3 == c) && r==R-1) {
                            Content[r].push(new DisplayObject(" ", "default"));
                        } else {
                            Content[r].push(new DisplayObject("━", "default"));
                        }
                    }
                    else if ( !(r == 0 || r == R-1) && (c==0 || c==C-1) ) Content[r].push(new DisplayObject("┃", "default"));
                    else if ( r==0 && c==0) Content[r].push(new DisplayObject("┏", "default"));
                    else if ( r==0 && c==C-1) Content[r].push(new DisplayObject("┓", "default"));
                    else if ( r==R-1 && c==0) Content[r].push(new DisplayObject("┗", "default"));
                    else if ( r==R-1 && c==C-1) Content[r].push(new DisplayObject("┛", "default"));
                    else Content[r].push(new DisplayObject(" ", "default", "blue"));
                }
            }
        }

        return Content;
    }

    static WriteToOverlay(Overlay, Text, X, Y, Color) {
        if (!Overlay.Content[Y]) { return; }
        for (const [Index, Char] of Text.split("").entries()) {
            if (!Overlay.Content[Y][Index+X]) { return; }

            Overlay.Content[Y][Index+X].Char = Char;
            Overlay.Content[Y][Index+X].Blank = false;

            if (Color) Overlay.Content[Y][Index+X].Color = Color;
        }
    }
}