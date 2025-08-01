/**
 * Command to delete a column from the grid.
 * Implements the Command pattern to allow undo-redo functionality.
 */
export class DeleteColumnCommand {
    /**
     * Creates a new DeleteColumnCommand.
     * @param {Grid} grid - The grid instance where the column will be deleted.
     * @param {number} colIndex - The index of the column to delete.
     */
    constructor(grid, colIndex) {
        this.grid = grid;
        this.colIndex = colIndex;
        /**
         * Stores the original data of the deleted column, keyed by row index.
         * Used to restore data during undo.
         * @type {Map<number, string>}
         */
        this.backupColumnData = new Map();
    }
    /**
     * Executes the command to delete the column:
     * - Backs up all cell values in the column.
     * - Removes the column from the grid.
     * - Clears the current column selection.
     * - Redraws the grid.
     */
    execute() {
        // Backup all cell values in this column (by row)
        for (let row = 0; row < this.grid.totalRows; row++) {
            const value = this.grid.getCellData(row, this.colIndex);
            if (value !== undefined) {
                this.backupColumnData.set(row, value);
            }
        }
        this.grid.removeColumn(this.colIndex);
        this.grid.setSelectedColumn(null); // clear selection
        this.grid.redraw();
    }
    /**
     * Undoes the delete column action:
     * - Reinserts the deleted column.
     * - Restores all previously backed-up cell values.
     * - Redraws the grid.
     */
    undo() {
        this.grid.insertColumn(this.colIndex); // Reinsert the column
        // Restore backed-up values into that column
        for (const [row, value] of this.backupColumnData.entries()) {
            this.grid.setCellData(row, this.colIndex, value);
        }
        this.grid.redraw();
    }
}
