export class DeleteRowCommand {
    constructor(grid, rowIndex) {
        this.grid = grid;
        this.rowIndex = rowIndex;
        this.deletedRowData = new Map();
    }
    execute() {
        // Backup the row data before deleting
        this.deletedRowData = this.grid.cloneRowData(this.rowIndex);
        this.grid.removeRow(this.rowIndex);
        this.grid.redraw();
    }
    undo() {
        this.grid.insertRow(this.rowIndex);
        this.grid.restoreRowData(this.rowIndex, this.deletedRowData);
        this.grid.redraw();
    }
}
