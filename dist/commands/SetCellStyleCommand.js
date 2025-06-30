export class SetCellStyleCommand {
    constructor(grid, row, col, newStyle) {
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.newStyle = newStyle;
        this.previousStyle = grid.getCellStyle(row, col);
    }
    execute() {
        const currentStyle = this.grid.getCellStyle(this.row, this.col) || {};
        const mergedStyle = { ...currentStyle, ...this.newStyle };
        this.grid.setCellStyle(this.row, this.col, mergedStyle);
        this.grid.redraw();
    }
    undo() {
        this.grid.setCellStyle(this.row, this.col, this.previousStyle || {});
        this.grid.redraw();
    }
}
