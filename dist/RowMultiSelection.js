/**
 * Handles drag-based multiple row selection in the grid.
 */
export class RowMultiSelection {
    /**
     * @param canvas The HTML canvas used for drawing the grid
     * @param grid The Grid instance representing the data and drawing logic
     */
    constructor(canvas, grid, selectionManager) {
        this.canvas = canvas;
        this.grid = grid;
        this.selectionManager = selectionManager;
        /** Whether a row selection drag operation is currently in progress */
        this.isDragging = false;
        /** The row index where the drag started */
        this.dragStartRow = -1;
        /** The row index where the drag currently ends */
        this.dragEndRow = -1;
        /**
         * Handles mouse down event on the canvas to begin row drag selection
         */
        this.onMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const container = document.getElementById("container");
            const scrollTop = container?.scrollTop;
            const headerWidth = this.grid.getColWidth(0);
            const headerHeight = this.grid.getRowHeight(0);
            // Only trigger selection when mouse is within row header region
            if (x < headerWidth && y >= headerHeight) {
                const adjustedY = y + scrollTop;
                const row = this.grid.getRowFromY(adjustedY);
                if (row > 0) {
                    this.isDragging = true;
                    this.dragStartRow = this.dragEndRow = row;
                    this.grid.clearSelection();
                    this.grid.setRowRangeSelection(this.dragStartRow, this.dragEndRow);
                    this.grid.redraw();
                }
            }
        };
        /**
         * Handles mouse move event to update the selected row range while dragging
         */
        this.onMouseMove = (e) => {
            if (!this.isDragging)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const container = document.getElementById("container");
            const scrollTop = container.scrollTop;
            const adjustedY = y + scrollTop;
            const row = this.grid.getRowFromY(adjustedY);
            if (row > 0) {
                this.dragEndRow = row;
                const start = Math.min(this.dragStartRow, this.dragEndRow);
                const end = Math.max(this.dragStartRow, this.dragEndRow);
                this.grid.setRowRangeSelection(start, end);
                this.grid.redraw();
            }
        };
        /**
         * Handles mouse up event to finalize the row drag selection
         */
        this.onMouseUp = (_e) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.selectionManager.suppressNextHeaderClick(); // Prevent conflict with header click logic
            }
        };
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
    }
}
