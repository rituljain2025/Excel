import { ResizeRowCommand } from "./commands/ResizeRowCommand.js";
/**
 * Handles mouse-based row resizing functionality in the grid.
 */
export class RowResizeHandler {
    /**
     * @param canvas The canvas element used for rendering the grid
     * @param grid The Grid instance for cell data and rendering
     * @param undoManager The UndoManager to support undo-redo of row resizing
     */
    constructor(canvas, grid, undoManager, selectionManager) {
        this.canvas = canvas;
        this.grid = grid;
        this.undoManager = undoManager;
        this.selectionManager = selectionManager;
        /** Whether the user is actively resizing a row */
        this.isResizing = false;
        /** Y position where resizing started */
        this.startY = 0;
        /** Initial height of the row before resize started */
        this.startHeight = 0;
        /** Index of the row currently being resized */
        this.targetRow = -1;
        /** Whether the mouse is currently hovering near a row border */
        this.isHovering = false;
        /** Tracks the final height of the row being resized */
        this.currentRowHeight = 0;
        /**
         * Triggered on mouse down — starts resizing if near row border in header area
         */
        this.onMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const container = document.getElementById("container");
            const scrollTop = container.scrollTop;
            const rowHeaderWidth = this.grid.getColWidth(0);
            // Only allow resizing in the row header area
            if (x >= rowHeaderWidth)
                return;
            const { start, end } = this.getVisibleRowRange(scrollTop);
            for (let i = start; i < end; i++) {
                const rowTop = this.grid.getRowY(i);
                const rowHeight = this.grid.getRowHeight(i);
                const relativeY = rowTop - scrollTop;
                const rowBottom = relativeY + rowHeight;
                if (y >= rowBottom - 5 && y <= rowBottom + 5) {
                    this.isResizing = true;
                    this.canvas._isRowResizing = true;
                    console.log(this.canvas._isRowResizing);
                    this.startY = y;
                    this.startHeight = rowHeight;
                    this.targetRow = i;
                    this.currentRowHeight = rowHeight;
                    this.canvas.style.cursor = "row-resize";
                    document.addEventListener("mousemove", this.onMouseMoveResize);
                    document.addEventListener("mouseup", this.onMouseUp);
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }
        };
        /**
         * Triggered on mouse move — updates the cursor to row-resize when hovering near row border
         */
        this.onMouseMove = (e) => {
            if (this.isResizing)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const container = document.getElementById("container");
            const scrollTop = container.scrollTop;
            const rowHeaderWidth = this.grid.getColWidth(0);
            if (x >= rowHeaderWidth) {
                if (this.isHovering) {
                    this.canvas.style.cursor = "default";
                    this.isHovering = false;
                }
                return;
            }
            const { start, end } = this.getVisibleRowRange(scrollTop);
            for (let i = start; i < end; i++) {
                const rowTop = this.grid.getRowY(i);
                const rowHeight = this.grid.getRowHeight(i);
                const relativeY = rowTop - scrollTop;
                const rowBottom = relativeY + rowHeight;
                if (y >= rowBottom - 5 && y <= rowBottom + 5) {
                    this.canvas.style.cursor = "row-resize";
                    this.isHovering = true;
                    return;
                }
            }
            if (this.isHovering) {
                this.canvas.style.cursor = "default";
                this.isHovering = false;
            }
        };
        /**
         * Triggered when the mouse leaves the canvas — resets the cursor
         */
        this.onMouseLeave = (e) => {
            if (!this.isResizing && this.isHovering) {
                this.canvas.style.cursor = "default";
                this.isHovering = false;
            }
        };
        /**
         * Handles resizing logic during mouse drag movement
         */
        this.onMouseMoveResize = (e) => {
            if (!this.isResizing)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const currentY = e.clientY - rect.top;
            const delta = currentY - this.startY;
            const newHeight = this.startHeight + delta;
            this.selectionManager.suppressNextHeaderClick();
            if (newHeight >= 20 && newHeight <= 200) {
                this.grid.setRowHeight(this.targetRow, newHeight);
                this.currentRowHeight = newHeight;
            }
        };
        /**
         * Triggered on mouse up — ends resize and pushes command to undo stack
         */
        this.onMouseUp = (e) => {
            if (this.isResizing) {
                if (this.startHeight !== this.currentRowHeight) {
                    const cmd = new ResizeRowCommand(this.grid, this.startHeight, this.currentRowHeight, this.targetRow);
                    this.undoManager.executeCommand(cmd);
                }
                this.canvas._isRowResizing = false;
                this.isResizing = false;
                this.targetRow = -1;
                this.currentRowHeight = 0;
                this.canvas.style.cursor = "default";
                this.isHovering = false;
                this.selectionManager.suppressNextHeaderClick();
                document.removeEventListener("mousemove", this.onMouseMoveResize);
                document.removeEventListener("mouseup", this.onMouseUp);
            }
        };
        this.setupEventListeners();
    }
    /**
     * Adds necessary mouse event listeners to the canvas
     */
    setupEventListeners() {
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseleave", this.onMouseLeave);
        this.canvas.style.cursor = "default";
    }
    /**
     * Calculates the visible range of rows in the canvas based on scroll position
     * @param scrollTop The vertical scroll offset
     * @returns An object with the `start` and `end` visible row indices
     */
    getVisibleRowRange(scrollTop) {
        const canvasHeight = this.canvas.height;
        const buffer = 100;
        let start = 1;
        for (let i = 1; i < this.grid.totalRows; i++) {
            const rowTop = this.grid.getRowY(i);
            const relativeY = rowTop - scrollTop;
            if (relativeY >= -buffer) {
                start = i;
                break;
            }
        }
        let end = this.grid.totalRows;
        for (let i = start; i < this.grid.totalRows; i++) {
            const rowTop = this.grid.getRowY(i);
            const relativeY = rowTop - scrollTop;
            if (relativeY > canvasHeight + buffer) {
                end = i;
                break;
            }
        }
        return { start, end };
    }
    isInRowResizeZone(x, y) {
        const rowHeaderWidth = this.grid.getColWidth(0);
        if (x > rowHeaderWidth)
            return false;
        const container = document.getElementById("container");
        const scrollTop = container.scrollTop;
        const adjustedY = y + scrollTop;
        let cumulativeY = 0;
        const tolerance = 5;
        for (let row = 0; row < this.grid.totalRows; row++) {
            const height = this.grid.getRowHeight(row);
            const bottomEdge = cumulativeY + height;
            if (Math.abs(adjustedY - bottomEdge) <= tolerance) {
                return true;
            }
            cumulativeY += height;
            if (cumulativeY > adjustedY + this.canvas.clientHeight) {
                break;
            }
        }
        return false;
    }
    /**
     * Destroys the event listeners and resets internal state
     */
    destroy() {
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.removeEventListener("mouseleave", this.onMouseLeave);
        document.removeEventListener("mousemove", this.onMouseMoveResize);
        document.removeEventListener("mouseup", this.onMouseUp);
        if (this.isResizing) {
            document.removeEventListener("mousemove", this.onMouseMoveResize);
            document.removeEventListener("mouseup", this.onMouseUp);
            this.canvas.style.cursor = "default";
            document.body.style.cursor = "default";
        }
    }
}
