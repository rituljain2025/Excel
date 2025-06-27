export class ResizeColumnCommand {
    constructor(grid, colIndex, newWidth) {
        this.grid = grid;
        this.colIndex = colIndex;
        this.newWidth = newWidth;
        this.oldWidth = grid.getColWidth(colIndex); // Save previous width
    }
    execute() {
        this.grid.setColWidth(this.colIndex, this.newWidth);
        this.grid.redraw();
    }
    undo() {
        this.grid.setColWidth(this.colIndex, this.oldWidth);
        this.grid.redraw();
    }
}
