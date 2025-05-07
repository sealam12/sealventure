import { MapObject, Item, Container, Entity } from "/static/js/Object.js";

export class Map {
    constructor(Objects) {
        this.Objects = Objects;
    }

    GetObj(X, Y) {
        return this.Objects[Y][X];
    }

    SetObj(X, Y, Object) {
        this.Objects[Y][X] = Object;
    }
}

export function GenerateSampleMap(R, C) {
    let Content = [];

    for (let r=0; r<R; r++) {
        Content.push([]);
        for (let c=0; c<C; c++) {
            if (r == 0 || r == R-1 || c==0 || c==C-1) {
                Content[r].push(new MapObject("#", true, "white", "Wall"))
            } else {
                Content[r].push(new MapObject(" ", false, "white", ""));
            }
        }
    }

    Content[1][2] = new Container(
        "C",
        true,
        "gold",
        "Chest",
        [ new Item("Sword", "S", 20), new Item("Axe", "A", 10), new Item("Torch", "T", 2) ]
    )

    Content[1][5] = new Entity(
        "E",
        true,
        "red",
        "Enemy",
        100,
        [ new Item("Sword", "S", 20), new Item("Axe", "A", 10), new Item("Torch", "T", 2) ]
    )

    //Content[1][2].Health = 100;

    return new Map(Content);
}

// WRITTEN BY MATTHEW CARMICHAEL, 2025