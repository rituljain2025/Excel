export class ResizeColCommand {
    constructor(grid, oldWidth, newWidth, colIndex) {
        this.grid = grid;
        this.oldWidth = oldWidth;
        this.newWidth = newWidth;
        this.colIndex = colIndex;
    }
    execute() {
        this.grid.setColWidth(this.colIndex, this.newWidth);
        this.grid.redraw();
    }
    undo() {
        this.grid.setColWidth(this.colIndex, this.oldWidth);
    }
}
