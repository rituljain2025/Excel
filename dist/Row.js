export class Row {
    constructor(height = 25) {
        this.cells = new Map();
        this.height = height;
    }
    getCell(col) {
        return this.cells.get(col);
    }
    setCell(col, cell) {
        this.cells.set(col, cell);
    }
}
