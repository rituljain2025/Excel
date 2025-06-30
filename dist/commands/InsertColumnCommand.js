/**
 * Command to insert a column into the grid.
 * Implements the Command interface to support undo-redo functionality.
 */
export class InsertColumnCommand {
    /**
     * Initializes a new instance of the InsertColumnCommand.
     * @param {Grid} grid - The grid instance where the column will be inserted.
     * @param {number} colIndex - The index at which the column will be inserted.
     */
    constructor(grid, colIndex) {
        this.grid = grid;
        this.colIndex = colIndex;
        /**
         * Stores the original data of the column being inserted,
         * keyed by row index. This backup allows restoring the data on undo.
         * @type {Map<number, string>}
         */
        this.backupColData = new Map();
    }
    /**
     * Executes the command:
     * - Clones and stores the current column data (if any).
     * - Inserts a new column at the specified index.
     * - Triggers a redraw of the grid.
     */
    execute() {
        this.backupColData = this.grid.cloneColumnData(this.colIndex);
        this.grid.insertColumn(this.colIndex);
        this.grid.redraw();
    }
    /**
     * Undoes the column insertion:
     * - Removes the inserted column.
     * - Restores the previously saved data into the original column index.
     * - Triggers a redraw of the grid.
     */
    undo() {
        this.grid.removeColumn(this.colIndex);
        this.grid.restoreColumnData(this.colIndex, this.backupColData);
        this.grid.redraw();
    }
}
