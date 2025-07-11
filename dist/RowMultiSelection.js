/**
 * Handles drag-based multiple row selection in the grid.
 */
export class RowMultiSelection {
    /**
     * @param canvas The HTML canvas used for drawing the grid
     * @param grid The Grid instance representing the data and drawing logic
     */
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        /** Whether a row selection drag operation is currently in progress */
        this.isDragging = false;
        /** The row index where the drag started */
        this.dragStartRow = -1;
        /** The row index where the drag currently ends */
        this.dragEndRow = -1;
        this.autoScrollInterval = null;
        this.lastMouseEvent = null;
        /**
         * Handles mouse down event on the canvas to begin row drag selection
         */
        this.onMouseDown = (e) => {
            if (this.canvas._isRowResizing)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left);
            const y = (e.clientY - rect.top);
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
                    this.grid.isRowDragging = true;
                    this.grid.setRowRangeSelection(this.dragStartRow, this.dragEndRow);
                    this.grid.redraw();
                }
            }
        };
        /**
         * Handles mouse move event to update the selected row range while dragging
         */
        this.onMouseMove = (e) => {
            if (this.canvas._isRowResizing)
                return;
            if (!this.isDragging)
                return;
            this.lastMouseEvent = e;
            const rect = this.canvas.getBoundingClientRect();
            const y = (e.clientY - rect.top);
            const container = document.getElementById("container");
            const scrollTop = container.scrollTop;
            const adjustedY = y + scrollTop;
            const row = this.grid.getRowFromY(adjustedY);
            if (row > 0) {
                this.dragEndRow = row;
                const start = Math.min(this.dragStartRow, this.dragEndRow);
                const end = Math.max(this.dragStartRow, this.dragEndRow);
                this.startAutoScroll();
                this.grid.setRowRangeSelection(start, end);
                this.grid.redraw();
            }
        };
        /**
         * Handles mouse up event to finalize the row drag selection
         */
        this.onMouseUp = (_e) => {
            if (this.canvas._isRowResizing)
                return;
            if (this.isDragging) {
                this.stopAutoScroll();
                this.isDragging = false;
                this.grid.isRowDragging = false;
            }
        };
    }
    startAutoScroll() {
        if (this.autoScrollInterval !== null)
            return; // Prevent multiple intervals
        const container = document.getElementById("container");
        const buffer = 50; // Distance from edge to trigger scroll
        const scrollSpeed = 10; // Pixels to scroll per interval
        const intervalTime = 50; // Interval time in ms
        this.autoScrollInterval = window.setInterval(() => {
            if (!this.isDragging || !this.lastMouseEvent)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const dy = (this.lastMouseEvent.clientY - rect.top);
            let scrolled = false;
            if (dy < buffer) {
                container.scrollTop -= scrollSpeed;
                scrolled = true;
            }
            if (dy > container.clientHeight - buffer) {
                container.scrollTop += scrollSpeed;
                scrolled = true;
            }
            if (scrolled) {
                const adjustedY = this.lastMouseEvent.clientY + container.scrollTop - rect.top;
                const row = this.grid.getRowFromY(adjustedY);
                if (row > 0) {
                    this.dragEndRow = row;
                    const start = Math.min(this.dragStartRow, this.dragEndRow);
                    const end = Math.max(this.dragStartRow, this.dragEndRow);
                    this.grid.setRowRangeSelection(start, end);
                    this.grid.redraw();
                }
            }
        });
    }
    stopAutoScroll() {
        if (this.autoScrollInterval !== null) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }
    getCursor(x, y) {
        return "cell";
    }
    hitTest(x, y) {
        const headerHeight = this.grid.getRowHeight(0);
        const rowHeaderWidth = this.grid.getColWidth(0);
        return y >= headerHeight && x < rowHeaderWidth;
    }
}
