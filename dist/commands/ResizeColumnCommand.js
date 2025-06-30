/**
 * Command to resize a column in the grid.
 * Implements the Command interface to support undo-redo functionality.
 */
export class ResizeColumnCommand {
    /**
     * Initializes a new instance of the ResizeColumnCommand.
     * @param {Grid} grid - The grid instance where the column will be resized.
     * @param {number} colIndex - The index of the column to resize.
     * @param {number} newWidth - The new width to apply to the column.
     */
    constructor(grid, colIndex, newWidth) {
        this.grid = grid;
        this.colIndex = colIndex;
        this.newWidth = newWidth;
        this.oldWidth = grid.getColWidth(colIndex); // Save previous width
    }
    /**
     * Executes the column resize:
     * - Sets the column width to the new value.
     * - Triggers a grid redraw to reflect the new size.
     */
    execute() {
        this.grid.setColWidth(this.colIndex, this.newWidth);
        this.grid.redraw();
    }
    /**
     * Undoes the column resize:
     * - Restores the original column width.
     * - Triggers a grid redraw to reflect the restoration.
     */
    undo() {
        this.grid.setColWidth(this.colIndex, this.oldWidth);
        this.grid.redraw();
    }
}
