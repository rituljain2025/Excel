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
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
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
        this.autoScrollInterval = null;
        this.lastMouseEvent = null;
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
            const x = (e.clientX - rect.left);
            const y = (e.clientY - rect.top);
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
                    this.grid.isColumnDragging = true;
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
            this.lastMouseEvent = e;
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left);
            const container = document.getElementById("container");
            const scrollLeft = container.scrollLeft;
            const adjustedX = x + scrollLeft;
            const col = this.grid.getColFromX(adjustedX);
            if (col > 0) {
                this.endCol = col;
                const start = Math.min(this.startCol, this.endCol);
                const end = Math.max(this.startCol, this.endCol);
                this.startAutoScroll();
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
                this.stopAutoScroll();
                this.grid.isColumnDragging = false;
                if (this.grid.onStatsUpdateCallback) {
                    const stats = this.grid.computeSelectedCellStats();
                    this.grid.onStatsUpdateCallback(stats);
                }
            }
        };
    }
    startAutoScroll() {
        if (this.autoScrollInterval !== null)
            return;
        const container = document.getElementById("container");
        const buffer = 50; // pixels from the edge to trigger scroll
        const scrollSpeed = 30; // pixels per interval
        const intervalTime = 20; // milliseconds
        this.autoScrollInterval = setInterval(() => {
            if (!this.isDragging || !this.lastMouseEvent)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (this.lastMouseEvent.clientX - rect.left);
            let scrolled = false;
            if (x < buffer) {
                container.scrollLeft -= scrollSpeed;
                scrolled = true;
            }
            else if (x > container.clientWidth - buffer) {
                container.scrollLeft += scrollSpeed;
                scrolled = true;
            }
            if (scrolled) {
                const adjustedX = x + container.scrollLeft;
                const col = this.grid.getColFromX(adjustedX);
                if (col > 0) {
                    this.endCol = col;
                    const start = Math.min(this.startCol, this.endCol);
                    const end = Math.max(this.startCol, this.endCol);
                    this.grid.setColumnRangeSelection(start, end);
                    this.grid.redraw();
                }
            }
        }, intervalTime);
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
        const col = this.grid.getColFromX(x);
        const colWidth = this.grid.getColWidth(col);
        return y < headerHeight && x >= colWidth;
    }
}
