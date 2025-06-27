export class InsertColumnCommand {
    constructor(grid, colIndex) {
        this.grid = grid;
        this.colIndex = colIndex;
        this.backupColData = new Map();
    }
    execute() {
        this.backupColData = this.grid.cloneColumnData(this.colIndex);
        this.grid.insertColumn(this.colIndex);
        this.grid.redraw();
    }
    undo() {
        this.grid.removeColumn(this.colIndex);
        this.grid.restoreColumnData(this.colIndex, this.backupColData);
        this.grid.redraw();
    }
}
