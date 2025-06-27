export class DeleteColumnCommand {
    constructor(grid, colIndex) {
        this.grid = grid;
        this.colIndex = colIndex;
        this.backupColumnData = new Map();
    }
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
    undo() {
        this.grid.insertColumn(this.colIndex); // Reinsert the column
        // Restore backed-up values into that column
        for (const [row, value] of this.backupColumnData.entries()) {
            this.grid.setCellData(row, this.colIndex, value);
        }
        this.grid.redraw();
    }
}
