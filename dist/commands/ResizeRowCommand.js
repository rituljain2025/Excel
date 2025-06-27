export class ResizeRowCommand {
    constructor(grid, oldHeigt, newHeight, rowIndex) {
        this.grid = grid;
        this.oldHeigt = oldHeigt;
        this.newHeight = newHeight;
        this.rowIndex = rowIndex;
    }
    execute() {
        this.grid.setRowHeight(this.rowIndex, this.newHeight);
        this.grid.redraw();
    }
    undo() {
        this.grid.setRowHeight(this.rowIndex, this.oldHeigt);
        this.grid.redraw();
    }
}
