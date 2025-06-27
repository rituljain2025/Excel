export class InsertColumn {
    constructor(grid) {
        this.grid = grid;
    }
    /**
     * Insert a new column before the specified column index
     * @param beforeColIndex - The column index before which to insert the new column
     */
    insertColumnBefore(beforeColIndex) {
        if (beforeColIndex < 1 || beforeColIndex >= this.grid.totalCols) {
            console.warn('Invalid column index for insertion');
            return;
        }
        // Increase total column count
        this.grid.totalCols++;
        // Efficiently shift existing cell data right
        this.shiftCellDataRightOptimized(beforeColIndex);
        // Insert new column width using optimized method
        this.insertColumnWidthOptimized(beforeColIndex);
        // Update spacer width only once
        this.updateSpacerWidth();
        // Clear any existing selections
        this.grid.clearSelection();
        // Redraw only once
        this.grid.redraw();
        console.log(`Column inserted before column ${beforeColIndex}`);
    }
    /**
     * Insert a new column after the specified column index
     * @param afterColIndex - The column index after which to insert the new column
     */
    insertColumnAfter(afterColIndex) {
        this.insertColumnBefore(afterColIndex + 1);
    }
    /**
     * Insert a column based on current selection
     */
    insertColumnFromSelection() {
        const selectedRange = this.grid.getSelectedRange();
        if (selectedRange) {
            // Cell range is selected - insert before the first column of selection
            this.insertColumnBefore(selectedRange.startCol);
        }
        else {
            // Check if a specific column is selected
            const selectedColumn = this.grid.getSelectedColumn?.() || null;
            if (selectedColumn !== null && selectedColumn > 0) {
                this.insertColumnBefore(selectedColumn);
            }
            else {
                // Default insertion at column 2 (after row header)
                this.insertColumnBefore(2);
            }
        }
    }
    /**
     * Optimized cell data shifting - only processes cells that actually contain data
     * @param fromColIndex - Starting column index from which to shift data right
     */
    shiftCellDataRightOptimized(fromColIndex) {
        // Get all columns that contain data and need to be shifted
        const columnsToShift = [];
        for (let col = fromColIndex; col < this.grid.totalCols - 1; col++) {
            if (this.hasColumnData(col)) {
                columnsToShift.push(col);
            }
        }
        // Process columns in reverse order to avoid overwriting
        columnsToShift.reverse().forEach(col => {
            this.moveColumnData(col, col + 1);
        });
    }
    /**
     * Check if a column has any data across all rows
     * @param col - Column index to check
     * @returns boolean indicating if column has data
     */
    hasColumnData(col) {
        // Check only a reasonable number of rows for performance
        const maxRowsToCheck = Math.min(this.grid.totalRows, 1000);
        for (let row = 1; row < maxRowsToCheck; row++) {
            if (this.grid.getCellData(row, col) !== undefined) {
                return true;
            }
        }
        return false;
    }
    /**
     * Move all data from source column to destination column
     * @param sourceCol - Source column index
     * @param destCol - Destination column index
     */
    moveColumnData(sourceCol, destCol) {
        // Only process rows that likely have data (limit for performance)
        const maxRowsToProcess = Math.min(this.grid.totalRows, 1000);
        for (let row = 1; row < maxRowsToProcess; row++) {
            const cellValue = this.grid.getCellData(row, sourceCol);
            if (cellValue !== undefined && cellValue !== '') {
                this.grid.setCellData(row, destCol, cellValue);
                this.grid.setCellData(row, sourceCol, ''); // Clear source
            }
        }
    }
    /**
     * Optimized column width insertion
     * @param colIndex - The column index where to insert the new width
     */
    insertColumnWidthOptimized(colIndex) {
        const defaultColWidth = 80;
        // Use the grid's method if available
        if (typeof this.grid.insertColumnWidthAt === 'function') {
            this.grid.insertColumnWidthAt(colIndex, defaultColWidth);
        }
        else {
            // Fallback: try to set column width directly
            try {
                this.grid.setColWidth(colIndex, defaultColWidth);
            }
            catch (error) {
                console.warn('Could not set column width:', error);
            }
        }
    }
    /**
     * Efficiently update spacer width
     */
    updateSpacerWidth() {
        // Calculate total width more efficiently for large grids
        let totalWidth = 0;
        const maxColsToCalculate = Math.min(this.grid.totalCols, 1000);
        for (let i = 0; i < maxColsToCalculate; i++) {
            totalWidth += this.grid.getColWidth(i);
        }
        // Add estimated width for remaining columns if total is very large
        if (this.grid.totalCols > 1000) {
            const avgWidth = totalWidth / 1000;
            totalWidth += (this.grid.totalCols - 1000) * avgWidth;
        }
        const spacer = document.getElementById("spacer");
        if (spacer) {
            spacer.style.width = totalWidth + "px";
        }
    }
    /**
     * Insert multiple columns efficiently in a single operation
     * @param beforeColIndex - The column index before which to insert columns
     * @param count - Number of columns to insert
     */
    insertMultipleColumns(beforeColIndex, count) {
        if (count <= 0 || beforeColIndex < 1 || beforeColIndex >= this.grid.totalCols) {
            console.warn('Invalid parameters for multiple column insertion');
            return;
        }
        // Batch update - increase total column count once
        this.grid.totalCols += count;
        // Shift data right by 'count' columns in one operation
        this.shiftCellDataRightByCount(beforeColIndex, count);
        // Insert multiple column widths
        for (let i = 0; i < count; i++) {
            this.insertColumnWidthOptimized(beforeColIndex + i);
        }
        // Update spacer and redraw only once
        this.updateSpacerWidth();
        this.grid.clearSelection();
        this.grid.redraw();
        console.log(`${count} columns inserted before column ${beforeColIndex}`);
    }
    /**
     * Shift cell data right by specified count in one operation
     * @param fromColIndex - Starting column index
     * @param count - Number of positions to shift right
     */
    shiftCellDataRightByCount(fromColIndex, count) {
        const columnsToShift = [];
        // Collect columns with data
        for (let col = fromColIndex; col < this.grid.totalCols - count; col++) {
            if (this.hasColumnData(col)) {
                columnsToShift.push(col);
            }
        }
        // Process in reverse order and shift by count
        columnsToShift.reverse().forEach(col => {
            this.moveColumnDataByCount(col, col + count);
        });
    }
    /**
     * Move column data by specified count
     * @param sourceCol - Source column
     * @param destCol - Destination column
     */
    moveColumnDataByCount(sourceCol, destCol) {
        const maxRowsToProcess = Math.min(this.grid.totalRows, 1000);
        for (let row = 1; row < maxRowsToProcess; row++) {
            const cellValue = this.grid.getCellData(row, sourceCol);
            if (cellValue !== undefined && cellValue !== '') {
                this.grid.setCellData(row, destCol, cellValue);
                this.grid.setCellData(row, sourceCol, '');
            }
        }
    }
    /**
     * Optimized delete column functionality
     * @param colIndex - The column index to delete
     */
    deleteColumn(colIndex) {
        if (colIndex < 1 || colIndex >= this.grid.totalCols) {
            console.warn('Invalid column index for deletion');
            return;
        }
        // Shift data left efficiently
        this.shiftCellDataLeftOptimized(colIndex);
        // Decrease total column count
        this.grid.totalCols--;
        // Update spacer and redraw once
        this.updateSpacerWidth();
        this.grid.clearSelection();
        this.grid.redraw();
        console.log(`Column ${colIndex} deleted`);
    }
    /**
     * Optimized leftward cell data shifting
     * @param fromColIndex - Starting column index from which to shift data left
     */
    shiftCellDataLeftOptimized(fromColIndex) {
        const maxRowsToProcess = Math.min(this.grid.totalRows, 1000);
        // Only process columns that have data
        for (let col = fromColIndex + 1; col < this.grid.totalCols; col++) {
            if (this.hasColumnData(col)) {
                for (let row = 1; row < maxRowsToProcess; row++) {
                    const cellValue = this.grid.getCellData(row, col);
                    if (cellValue !== undefined && cellValue !== '') {
                        this.grid.setCellData(row, col - 1, cellValue);
                        this.grid.setCellData(row, col, '');
                    }
                }
            }
        }
        // Clear the last column if it had data
        const lastCol = this.grid.totalCols - 1;
        if (this.hasColumnData(lastCol)) {
            for (let row = 1; row < maxRowsToProcess; row++) {
                this.grid.setCellData(row, lastCol, '');
            }
        }
    }
    /**
     * Generate the next column label in Excel style (A, B, C, ..., Z, AA, AB, etc.)
     * @param colIndex - The column index (0-based)
     * @returns The column label string
     */
    getColumnLabel(colIndex) {
        let label = '';
        while (colIndex >= 0) {
            label = String.fromCharCode((colIndex % 26) + 65) + label;
            colIndex = Math.floor(colIndex / 26) - 1;
        }
        return label;
    }
    /**
     * Insert a column with a specific header label (optimized)
     * @param beforeColIndex - The column index before which to insert
     * @param headerLabel - The header label for the new column
     */
    insertColumnWithHeader(beforeColIndex, headerLabel) {
        this.insertColumnBefore(beforeColIndex);
        // Set header label efficiently
        if (headerLabel) {
            this.grid.setCellData(1, beforeColIndex, headerLabel);
        }
        else {
            const defaultLabel = this.getColumnLabel(beforeColIndex - 1);
            this.grid.setCellData(1, beforeColIndex, defaultLabel);
        }
        // Single redraw
        this.grid.redraw();
    }
    /**
     * Quick method to insert a column after the currently selected column
     */
    insertColumnAfterSelection() {
        const selectedRange = this.grid.getSelectedRange();
        if (selectedRange) {
            this.insertColumnAfter(selectedRange.endCol);
        }
        else {
            const selectedColumn = this.grid.getSelectedColumn?.() || null;
            if (selectedColumn !== null && selectedColumn > 0) {
                this.insertColumnAfter(selectedColumn);
            }
            else {
                this.insertColumnAfter(1); // After row header
            }
        }
    }
}
