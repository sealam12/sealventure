export class Map {
    constructor(Objects) {
        this.Objects = Objects;
    }

    GetObjects() {
        return this.Objects;
    }

    GetObj(X, Y) {
        return this.Objects[Y][X];
    }

    SetObj(X, Y, Object) {
        this.Objects[Y][X] = Object;
    }
}

// WRITTEN BY MATTHEW CARMICHAEL, 2025