/**
 * Handles mouse-based column range selection in the grid.
 * This allows users to click and drag across column headers to select multiple columns.
 */
export class ColumnSelectionHandler {
    /**
     * Attaches mouse event listeners to the canvas to manage column selection.
     * @param {HTMLCanvasElement} canvas - The canvas where the grid is rendered.
     * @param {Grid} grid - The grid instance to manipulate column selection state.
     */
    constructor(canvas, grid, selectionManager, resizeHandler) {
        this.canvas = canvas;
        this.grid = grid;
        this.selectionManager = selectionManager;
        this.resizeHandler = resizeHandler;
        /**
         * Indicates whether a drag operation is in progress.
         * @type {boolean}
         */
        this.isDragging = false;
        /**
         * Index of the column where the drag started.
         * @type {number}
         */
        this.startCol = -1;
        /**
         * Index of the column where the drag ended.
         * @type {number}
         */
        this.endCol = -1;
        /**
         * Triggered when the user presses the mouse button.
         * If the press occurs within the column header area (but not the row header),
         * it starts tracking for a drag-to-select column range.
         *
         * @param {MouseEvent} e - The mouse down event.
         */
        this.onMouseDown = (e) => {
            if (this.canvas._isResizing)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Prevent selection if in resize zone
            if (this.resizeHandler.isInResizeZone(x, y))
                return;
            const container = document.getElementById("container");
            const scrollLeft = container.scrollLeft;
            const headerHeight = this.grid.getRowHeight(0);
            const rowHeaderWidth = this.grid.getColWidth(0);
            // Only allow selection if clicking inside the column header area
            if (y < headerHeight && x >= rowHeaderWidth) {
                const adjustedX = x + scrollLeft;
                const col = this.grid.getColFromX(adjustedX);
                if (col > 0) {
                    this.isDragging = true;
                    this.startCol = this.endCol = col;
                    this.grid.clearSelection();
                    console.log("column clicked");
                    this.grid.setColumnRangeSelection(this.startCol, this.endCol);
                    this.grid.redraw();
                }
            }
        };
        /**
         * Triggered when the mouse is moved while dragging.
         * Dynamically updates the selected column range during the drag operation.
         *
         * @param {MouseEvent} e - The mouse move event.
         */
        this.onMouseMove = (e) => {
            if (!this.isDragging)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const container = document.getElementById("container");
            const scrollLeft = container.scrollLeft;
            const adjustedX = x + scrollLeft;
            const col = this.grid.getColFromX(adjustedX);
            if (col > 0) {
                this.endCol = col;
                const start = Math.min(this.startCol, this.endCol);
                const end = Math.max(this.startCol, this.endCol);
                this.grid.setColumnRangeSelection(start, end);
                this.grid.redraw();
            }
        };
        /**
         * Triggered when the mouse button is released.
         * Finalizes the column range selection and prevents a single-click from being misinterpreted.
         *
         * @param {MouseEvent} _e - The mouse up event.
         */
        this.onMouseUp = (_e) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.selectionManager.suppressNextHeaderClick(); // Prevents interference with click-based selection
                if (this.grid.onStatsUpdateCallback) {
                    const stats = this.grid.computeSelectedCellStats();
                    this.grid.onStatsUpdateCallback(stats);
                }
                console.log("Column range selected:", this.startCol, "to", this.endCol);
            }
        };
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
    }
    destroy() {
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
    }
}
