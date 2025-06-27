export class EditCellCommand {
    constructor(grid, row, col, oldValue, newValue) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
    execute() {
        this.grid.setCellData(this.row, this.col, this.newValue);
        this.grid.redraw();
    }
    undo() {
        this.grid.setCellData(this.row, this.col, this.oldValue);
        this.grid.redraw();
    }
}
