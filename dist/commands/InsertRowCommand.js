export class InsertRowCommand {
    constructor(grid, rowIndex) {
        this.grid = grid;
        this.rowIndex = rowIndex;
        this.backupRowData = new Map();
    }
    execute() {
        // Save the current data of the row being shifted
        this.backupRowData = this.grid.cloneRowData(this.rowIndex);
        // Insert row
        this.grid.insertRow(this.rowIndex);
        this.grid.redraw();
    }
    undo() {
        // Remove the inserted row
        this.grid.removeRow(this.rowIndex);
        // Restore original row data
        this.grid.restoreRowData(this.rowIndex, this.backupRowData);
        this.grid.redraw();
    }
}
