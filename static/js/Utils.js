import { DisplayObject } from "/static/js/Object.js";

export async function WaitForKey() {
  return new Promise((resolve) => {
    document.addEventListener('keydown', (event) => {
      resolve(event);
    }, { once: true }); // Ensures the listener is removed after the first key press
  });
}

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
    static CreateEmptyGrid(rows, cols) {
        return Array(rows).fill().map(() => Array(cols).fill().map(() => new DisplayObject(' ')));
    }

    static DrawRoom(grid, x, y, roomId) {
        const typeCode = this.rooms[roomId].Type[0].toUpperCase();
        const color = {
            "F": "red",
            "L": "gold",
            "R": "lightgreen",
            "B": "darkred"
        }[typeCode] || 'white';

        // Always use two characters for display
        let char = window.Game.CurrentRoom == roomId ? " @" : 
                   this.rooms[roomId].Unlocked ? " *" :
                   roomId < 10 ? ` ${roomId}` : roomId.toString();

        // Draw both characters of the room display
        grid[y][x] = new DisplayObject(char[0], color);
        grid[y][x + 1] = new DisplayObject(char[1], color);
    }

    static DrawConnection(grid, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        // Adjust x1 to start from the right edge of the room number (2 chars)
        const startX = x1 + 2;
        
        if (dy === 0) { // horizontal connection
            const step = dx > 0 ? 1 : -1;
            for (let x = startX; x !== x2; x += step) {
                grid[y1][x] = new DisplayObject('─', 'gold');
            }
        } else { // vertical connection
            const step = dy > 0 ? 1 : -1;
            // Draw the first corner
            grid[y1 + step][startX - 1] = new DisplayObject('│', 'gold');
            
            // Draw the middle section
            for (let y = y1 + step * 2; y !== y2; y += step) {
                grid[y][startX - 1] = new DisplayObject('│', 'gold');
            }
            
            // If there's a horizontal offset, draw the corner and horizontal line
            if (dx !== 0) {
                grid[y2][startX - 1] = new DisplayObject('┴', 'gold');
                const hStep = dx > 0 ? 1 : -1;
                for (let x = startX; x !== x2; x += hStep) {
                    grid[y2][x] = new DisplayObject('─', 'gold');
                }
            }
        }
    }

    static GetTreeWidth(graph, roomId) {
        const room = graph.find(r => r.RoomID === roomId);
        if (!room || !room.Children || room.Children.length === 0) return 1;
        
        return room.Children.reduce((sum, childId) => 
            sum + this.GetTreeWidth(graph, childId), 0);
    }

    static CalculatePositions(graph, roomId = 0, level = 0, startX = 0) {
        const positions = new Map();
        const room = graph.find(r => r.RoomID === roomId);
        if (!room) return positions;

        // Reduced spacing for more compact layout
        const spacing = 4; // Reduced from 8 to 4 for more compactness
        const verticalSpacing = 2; // Also reduce vertical spacing
        
        const treeWidth = this.GetTreeWidth(graph, roomId);
        const x = Math.floor(startX + (treeWidth - 1) * spacing / 2);
        const y = level * verticalSpacing;
        positions.set(roomId, { x, y });

        if (room.Children && room.Children.length > 0) {
            let currentX = startX;
            room.Children.forEach(childId => {
                const childWidth = this.GetTreeWidth(graph, childId);
                const childPositions = this.CalculatePositions(
                    graph,
                    childId,
                    level + 1,
                    currentX
                );
                childPositions.forEach((pos, id) => positions.set(id, pos));
                currentX += childWidth * spacing;
            });
        }

        return positions;
    }

    static FindGridDimensions(positions) {
        let maxX = 0;
        let maxY = 0;
        
        positions.forEach((pos) => {
            // Add 2 for the room width (2 characters)
            const roomEndX = pos.x + 2;
            maxX = Math.max(maxX, roomEndX);
            maxY = Math.max(maxY, pos.y);
        });
        
        // Add padding to the dimensions
        const paddingX = 5;
        const paddingY = 3;
        
        return {
            cols: maxX + paddingX,
            rows: maxY + paddingY
        };
    }

    static Visualize(graph) {
        this.rooms = graph;
        
        // Calculate positions for all rooms
        const positions = this.CalculatePositions(graph);
        
        // Dynamically determine grid size based on room positions
        const { rows, cols } = this.FindGridDimensions(positions);
        
        // Create a grid with the calculated dimensions
        const grid = this.CreateEmptyGrid(rows, cols);
        
        // Draw connections first (so rooms appear on top)
        graph.forEach(room => {
            const pos = positions.get(room.RoomID);
            if (!pos) return;

            room.Children?.forEach(childId => {
                const childPos = positions.get(childId);
                if (childPos) {
                    this.DrawConnection(grid, pos.x, pos.y, childPos.x, childPos.y);
                }
            });
        });

        // Draw rooms last so they appear on top of connections
        graph.forEach(room => {
            const pos = positions.get(room.RoomID);
            if (!pos) return;
            this.DrawRoom(grid, pos.x, pos.y, room.RoomID);
        });

        return grid;
    }
}

// WRITTEN BY MATTHEW CARMICHAEL, 2025