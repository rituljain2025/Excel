export class InsertRow {
    constructor(grid) {
        this.grid = grid;
    }
    /**
     * Insert a new row before the specified row index
     * @param beforeRowIndex - The row index before which to insert the new row
     */
    insertRowBefore(beforeRowIndex) {
        if (beforeRowIndex < 1 || beforeRowIndex >= this.grid.totalRows) {
            console.warn('Invalid row index for insertion');
            return;
        }
        // Increase total row count
        this.grid.totalRows++;
        // Efficiently shift existing cell data down
        this.shiftCellDataDownOptimized(beforeRowIndex);
        // Insert new row height using array splice for efficiency
        this.insertRowHeightOptimized(beforeRowIndex);
        // Update spacer height only once
        this.updateSpacerHeight();
        // Clear any existing selections
        this.grid.clearSelection();
        // Redraw only once
        this.grid.redraw();
        console.log(`Row inserted before row ${beforeRowIndex}`);
    }
    /**
     * Insert a new row after the specified row index
     * @param afterRowIndex - The row index after which to insert the new row
     */
    insertRowAfter(afterRowIndex) {
        this.insertRowBefore(afterRowIndex + 1);
    }
    /**
     * Insert a row based on current selection
     */
    insertRowFromSelection() {
        const selectedRange = this.grid.getSelectedRange();
        if (selectedRange) {
            // Cell range is selected - insert before the first row of selection
            this.insertRowBefore(selectedRange.startRow);
        }
        else {
            // Check if a specific row is selected
            const selectedRow = this.grid.getSelectedRow?.() || null;
            if (selectedRow !== null && selectedRow > 0) {
                this.insertRowBefore(selectedRow);
            }
            else {
                // Default insertion at row 2 (after header)
                this.insertRowBefore(2);
            }
        }
    }
    /**
     * Optimized cell data shifting - only processes cells that actually contain data
     * @param fromRowIndex - Starting row index from which to shift data down
     */
    shiftCellDataDownOptimized(fromRowIndex) {
        // Get all row keys that need to be shifted (only rows with actual data)
        const rowsToShift = [];
        // Only iterate through rows that have data
        for (let row = fromRowIndex; row < this.grid.totalRows - 1; row++) {
            if (this.hasRowData(row)) {
                rowsToShift.push(row);
            }
        }
        // Process rows in reverse order to avoid overwriting
        rowsToShift.reverse().forEach(row => {
            // Move entire row data to row + 1
            this.moveRowData(row, row + 1);
        });
    }
    /**
     * Check if a row has any data
     * @param row - Row index to check
     * @returns boolean indicating if row has data
     */
    hasRowData(row) {
        for (let col = 1; col < this.grid.totalCols; col++) {
            if (this.grid.getCellData(row, col) !== undefined) {
                return true;
            }
        }
        return false;
    }
    /**
     * Move all data from source row to destination row
     * @param sourceRow - Source row index
     * @param destRow - Destination row index
     */
    moveRowData(sourceRow, destRow) {
        for (let col = 1; col < this.grid.totalCols; col++) {
            const cellValue = this.grid.getCellData(sourceRow, col);
            if (cellValue !== undefined) {
                this.grid.setCellData(destRow, col, cellValue);
                this.grid.setCellData(sourceRow, col, ''); // Clear source
            }
        }
    }
    /**
     * Optimized row height insertion using array operations
     * @param rowIndex - The row index where to insert the new height
     */
    insertRowHeightOptimized(rowIndex) {
        const defaultRowHeight = 25;
        // Use the grid's method if available, otherwise set directly
        if (typeof this.grid.insertRowHeightAt === 'function') {
            this.grid.insertRowHeightAt(rowIndex, defaultRowHeight);
        }
        else {
            // Fallback: try to set row height directly
            try {
                this.grid.setRowHeight(rowIndex, defaultRowHeight);
            }
            catch (error) {
                console.warn('Could not set row height:', error);
            }
        }
    }
    /**
     * Efficiently update spacer height by calculating incrementally
     */
    updateSpacerHeight() {
        // Calculate total height more efficiently
        let totalHeight = 0;
        for (let i = 0; i < Math.min(this.grid.totalRows, 1000); i++) { // Limit calculation for performance
            totalHeight += this.grid.getRowHeight(i);
        }
        // Add estimated height for remaining rows if total is very large
        if (this.grid.totalRows > 1000) {
            const avgHeight = totalHeight / 1000;
            totalHeight += (this.grid.totalRows - 1000) * avgHeight;
        }
        const spacer = document.getElementById("spacer");
        if (spacer) {
            spacer.style.height = totalHeight + "px";
        }
    }
    /**
     * Insert multiple rows efficiently in a single operation
     * @param beforeRowIndex - The row index before which to insert rows
     * @param count - Number of rows to insert
     */
    insertMultipleRows(beforeRowIndex, count) {
        if (count <= 0 || beforeRowIndex < 1 || beforeRowIndex >= this.grid.totalRows) {
            console.warn('Invalid parameters for multiple row insertion');
            return;
        }
        // Batch update - increase total row count once
        this.grid.totalRows += count;
        // Shift data down by 'count' rows in one operation
        this.shiftCellDataDownByCount(beforeRowIndex, count);
        // Insert multiple row heights
        for (let i = 0; i < count; i++) {
            this.insertRowHeightOptimized(beforeRowIndex + i);
        }
        // Update spacer and redraw only once
        this.updateSpacerHeight();
        this.grid.clearSelection();
        this.grid.redraw();
        console.log(`${count} rows inserted before row ${beforeRowIndex}`);
    }
    /**
     * Shift cell data down by specified count in one operation
     * @param fromRowIndex - Starting row index
     * @param count - Number of positions to shift down
     */
    shiftCellDataDownByCount(fromRowIndex, count) {
        const rowsToShift = [];
        // Collect rows with data
        for (let row = fromRowIndex; row < this.grid.totalRows - count; row++) {
            if (this.hasRowData(row)) {
                rowsToShift.push(row);
            }
        }
        // Process in reverse order and shift by count
        rowsToShift.reverse().forEach(row => {
            this.moveRowData(row, row + count);
        });
    }
    /**
     * Optimized delete row functionality
     * @param rowIndex - The row index to delete
     */
    deleteRow(rowIndex) {
        if (rowIndex < 1 || rowIndex >= this.grid.totalRows) {
            console.warn('Invalid row index for deletion');
            return;
        }
        // Shift data up efficiently
        this.shiftCellDataUpOptimized(rowIndex);
        // Decrease total row count
        this.grid.totalRows--;
        // Update spacer and redraw once
        this.updateSpacerHeight();
        this.grid.clearSelection();
        this.grid.redraw();
        console.log(`Row ${rowIndex} deleted`);
    }
    /**
     * Optimized upward cell data shifting
     * @param fromRowIndex - Starting row index from which to shift data up
     */
    shiftCellDataUpOptimized(fromRowIndex) {
        // Only process rows that have data
        for (let row = fromRowIndex + 1; row < this.grid.totalRows; row++) {
            if (this.hasRowData(row)) {
                this.moveRowData(row, row - 1);
            }
        }
        // Clear the last row if it had data
        const lastRow = this.grid.totalRows - 1;
        if (this.hasRowData(lastRow)) {
            for (let col = 1; col < this.grid.totalCols; col++) {
                this.grid.setCellData(lastRow, col, '');
            }
        }
    }
    /**
     * Quick method to insert a row after the currently selected row
     */
    insertRowAfterSelection() {
        const selectedRange = this.grid.getSelectedRange();
        if (selectedRange) {
            this.insertRowAfter(selectedRange.endRow);
        }
        else {
            const selectedRow = this.grid.getSelectedRow?.() || null;
            if (selectedRow !== null && selectedRow > 0) {
                this.insertRowAfter(selectedRow);
            }
            else {
                this.insertRowAfter(1); // After header
            }
        }
    }
}
