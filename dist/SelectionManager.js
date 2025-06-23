export class SelectionManager {
    constructor() {
        this.isMouseDown = false;
        this.isDragging = false;
        this.startRow = 0;
        this.startCol = 0;
        this.endRow = 0;
        this.endCol = 0;
        this.selection = null;
    }
    /**
     * Handles pointer down (mouse click or drag start)
     */
    handlePointerDown(x, y, colWidths, rowHeights) {
        this.isMouseDown = true;
        this.isDragging = true;
        const col = this.getColFromX(x, colWidths);
        const row = this.getRowFromY(y, rowHeights);
        this.startCol = col;
        this.startRow = row;
        this.endCol = col;
        this.endRow = row;
        this.updateSelection();
    }
    /**
     * Handles pointer move (dragging)
     */
    handlePointerMove(x, y, colWidths, rowHeights) {
        if (!this.isMouseDown)
            return;
        this.endCol = this.getColFromX(x, colWidths);
        this.endRow = this.getRowFromY(y, rowHeights);
        this.updateSelection();
    }
    /**
     * Handles pointer up (mouse release)
     */
    handlePointerUp() {
        this.isMouseDown = false;
        this.isDragging = false;
    }
    /**
     * Returns current selection bounds
     */
    getSelectionBounds() {
        return this.selection;
    }
    /**
     * Converts x pixel to column index
     */
    getColFromX(x, colWidths) {
        let acc = 0;
        for (let i = 0; i < colWidths.length; i++) {
            acc += colWidths[i];
            if (x < acc)
                return i;
        }
        return colWidths.length - 1;
    }
    /**
     * Converts y pixel to row index
     */
    getRowFromY(y, rowHeights) {
        let acc = 0;
        for (let i = 0; i < rowHeights.length; i++) {
            acc += rowHeights[i];
            if (y < acc)
                return i;
        }
        return rowHeights.length - 1;
    }
    /**
     * Calculates the current selection bounds
     */
    updateSelection() {
        const top = Math.min(this.startRow, this.endRow);
        const bottom = Math.max(this.startRow, this.endRow);
        const left = Math.min(this.startCol, this.endCol);
        const right = Math.max(this.startCol, this.endCol);
        this.selection = { top, bottom, left, right };
    }
    /**
     * Used to support column header click to select whole column
     */
    selectEntireColumn(col, totalRows) {
        this.selection = {
            top: 1, // skip header row
            bottom: totalRows - 1,
            left: col,
            right: col,
        };
    }
}
