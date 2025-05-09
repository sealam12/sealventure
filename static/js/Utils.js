import { DisplayObject } from "/static/js/Object.js";

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function distance(x1,y1,x2,y2) {
    let a = x2-x1;
    let b = y2-y1;
    let c2 = (a**2) + (b**2)
    let c = Math.sqrt(c2);
    return Math.floor(c);
}

export class RoomVisualizer {
    static CreateEmptyGrid(Rows, Cols) {
        return Array(Rows).fill().map(() => Array(Cols).fill().map(() => new DisplayObject(' ')));
    }

    static DrawRoom(Grid, X, Y, RoomId) {
        const TypeCode = this.Rooms[RoomId].Type[0].toUpperCase();
        const Color = {
            "F": "firebrick",
            "L": "gold",
            "R": "lightgreen",
        }[TypeCode];

        let Char = this.Rooms[RoomId].Unlocked ? "*" : "#";

        if (window.Game.CurrentRoom == RoomId) Char = "@";

        Grid[Y][X] = new DisplayObject(Char, Color);
    }

    static DrawConnection(Grid, X1, Y1, X2, Y2) {
        const DX = X2 - X1;
        const DY = Y2 - Y1;
        
        if (DY === 0) { // horizontal connection
            const Step = DX > 0 ? 1 : -1;
            for (let X = X1 + Step; X !== X2; X += Step) {
                Grid[Y1][X] = new DisplayObject('─', 'gold');
            }
        } else { // vertical connection
            const Step = DY > 0 ? 1 : -1;
            // Draw the first corner
            Grid[Y1 + Step][X1] = new DisplayObject('│', 'gold');
            
            // Draw the middle section
            for (let Y = Y1 + Step * 2; Y !== Y2; Y += Step) {
                Grid[Y][X1] = new DisplayObject('│', 'gold');
            }
            
            // If there's a horizontal offset, draw the corner and horizontal line
            if (DX !== 0) {
                Grid[Y2][X1] = new DisplayObject('┴', 'gold');
                const HStep = DX > 0 ? 1 : -1;
                for (let X = X1 + HStep; X !== X2; X += HStep) {
                    Grid[Y2][X] = new DisplayObject('─', 'gold');
                }
            }
        }
    }

    static GetTreeWidth(Graph, RoomId) {
        const Room = Graph.find(R => R.RoomID === RoomId);
        if (!Room || !Room.Children || Room.Children.length === 0) return 1;
        
        return Room.Children.reduce((Sum, ChildId) => 
            Sum + this.GetTreeWidth(Graph, ChildId), 0);
    }

    static CalculatePositions(Graph, RoomId = 0, Level = 0, StartX = 0) {
        const Positions = new Map();
        const Room = Graph.find(R => R.RoomID === RoomId);
        if (!Room) return Positions;

        const TreeWidth = this.GetTreeWidth(Graph, RoomId);
        const Spacing = 8;
        const X = Math.floor(StartX + (TreeWidth - 1) * Spacing / 2);
        const Y = Level * 3;
        Positions.set(RoomId, { X, Y });

        if (Room.Children && Room.Children.length > 0) {
            let CurrentX = StartX;
            Room.Children.forEach(ChildId => {
                const ChildWidth = this.GetTreeWidth(Graph, ChildId);
                const ChildPositions = this.CalculatePositions(
                    Graph,
                    ChildId,
                    Level + 1,
                    CurrentX
                );
                ChildPositions.forEach((Pos, Id) => Positions.set(Id, Pos));
                CurrentX += ChildWidth * Spacing;
            });
        }

        return Positions;
    }

    static Visualize(Graph) {
        this.Rooms = Graph;
        const Rows = 30;
        const Cols = 75;
        const Grid = this.CreateEmptyGrid(Rows, Cols);
        
        // Calculate positions for all rooms
        const Positions = this.CalculatePositions(Graph);
        
        // Draw connections first (so rooms appear on top)
        Graph.forEach(Room => {
            const Pos = Positions.get(Room.RoomID);
            if (!Pos) return;

            Room.Children?.forEach(ChildId => {
                const ChildPos = Positions.get(ChildId);
                if (ChildPos) {
                    this.DrawConnection(Grid, Pos.X, Pos.Y, ChildPos.X, ChildPos.Y);
                }
            });
        });

        // Draw rooms last so they appear on top of connections
        Graph.forEach(Room => {
            const Pos = Positions.get(Room.RoomID);
            if (!Pos) return;
            this.DrawRoom(Grid, Pos.X, Pos.Y, Room.RoomID);
        });

        return Grid;
    }
}

// WRITTEN BY MATTHEW CARMICHAEL, 2025