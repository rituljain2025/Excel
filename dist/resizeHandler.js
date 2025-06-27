import { ResizeColumnCommand } from './commands/ResizeColumnCommand.js';
export class ResizeHandler {
    constructor(canvas, grid, undoManager) {
        this.canvas = canvas;
        this.grid = grid;
        this.undoManager = undoManager;
        this.isResizing = false;
        this.startX = 0;
        this.startWidth = 0;
        this.resizingColIndex = -1;
        this.isHovering = false;
        this.currentNewWidth = 0; // Track width during resizing
        this.onMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Only allow resizing if mouse is within the column header area
            if (!this.isInColumnHeader(y)) {
                console.log("Not in column header area");
                return;
            }
            const container = document.getElementById("container");
            const scrollLeft = container.scrollLeft;
            let cumulativeX = -scrollLeft; // Account for horizontal scroll
            for (let col = 0; col < 500; col++) {
                const width = this.grid.getColWidth(col);
                // Check if mouse is within 5px of the right edge of this column
                if (Math.abs(x - (cumulativeX + width)) < 5) {
                    console.log("Starting resize for column:", col);
                    this.isResizing = true;
                    this.resizingColIndex = col;
                    this.startX = x;
                    this.startWidth = width;
                    this.canvas.style.cursor = "col-resize";
                    // document.body.style.cursor = "col-resize";
                    window.addEventListener("mousemove", this.onMouseMoveResize);
                    window.addEventListener("mouseup", this.onMouseUp);
                    // Prevent default to avoid interfering with other mouse handlers
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                cumulativeX += width;
                // Stop checking if we've passed the visible area
                if (cumulativeX > this.canvas.width + scrollLeft)
                    break;
            }
        };
        // Main for resize
        this.onMouseMoveResize = (e) => {
            if (!this.isResizing || this.resizingColIndex === -1)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const delta = currentX - this.startX;
            const newWidth = this.startWidth + delta;
            this.grid.suppressNextHeaderClick();
            console.log("Resizing column", this.resizingColIndex, "to width:", newWidth);
            if (newWidth >= 30 && newWidth <= 500) {
                this.grid.setColWidth(this.resizingColIndex, newWidth);
                this.currentNewWidth = newWidth; // Track final width for undo
            }
        };
        // Called by mouseDown after resizing
        this.onMouseUp = () => {
            if (this.isResizing) {
                console.log("Ending column resize");
                // Store values before resetting
                const colIndex = this.resizingColIndex;
                const oldWidth = this.startWidth;
                const newWidth = this.currentNewWidth;
                // Reset state
                this.isResizing = false;
                this.resizingColIndex = -1;
                this.currentNewWidth = 0;
                // Create undo command if width actually changed
                if (oldWidth !== newWidth && newWidth >= 30 && newWidth <= 500) {
                    console.log(`Creating resize command for column ${colIndex}: ${oldWidth} -> ${newWidth}`);
                    // Reset to original width first, then execute command
                    this.grid.setColWidth(colIndex, oldWidth);
                    const cmd = new ResizeColumnCommand(this.grid, colIndex, newWidth);
                    this.undoManager.executeCommand(cmd);
                }
                this.canvas.style.cursor = "default";
                document.body.style.cursor = "default";
                this.isHovering = false;
                window.removeEventListener("mousemove", this.onMouseMoveResize);
                window.removeEventListener("mouseup", this.onMouseUp);
            }
        };
        this.onMouseMove = (e) => {
            if (this.isResizing)
                return; // Don't change cursor while resizing
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Only show resize cursor if mouse is within the column header area
            if (!this.isInColumnHeader(y)) {
                if (this.isHovering) {
                    this.canvas.style.cursor = "default";
                    this.isHovering = false;
                }
                return;
            }
            const container = document.getElementById("container");
            const scrollLeft = container.scrollLeft;
            let cumulativeX = -scrollLeft;
            let foundResizeBorder = false;
            for (let col = 0; col < 500; col++) {
                const width = this.grid.getColWidth(col);
                // Check if mouse is within 5px of the right edge of this column
                if (Math.abs(x - (cumulativeX + width)) < 5) {
                    this.grid.suppressNextHeaderClick();
                    this.canvas.style.cursor = "col-resize";
                    this.isHovering = true;
                    foundResizeBorder = true;
                    break;
                }
                cumulativeX += width;
                // Stop checking if we've passed the visible area
                if (cumulativeX > this.canvas.width + scrollLeft)
                    break;
            }
            if (!foundResizeBorder && this.isHovering) {
                this.canvas.style.cursor = "default";
                this.isHovering = false;
            }
        };
        this.onMouseLeave = () => {
            if (!this.isResizing && this.isHovering) {
                this.canvas.style.cursor = "default";
                this.isHovering = false;
            }
        };
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseleave", this.onMouseLeave);
        // // Set default cursor
        // this.canvas.style.cursor = "cell";
    }
    isInColumnHeader(y) {
        const headerHeight = this.grid.getRowHeight(0);
        return y >= 0 && y <= headerHeight;
    }
    // Clean up method to remove event listeners
    destroy() {
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.removeEventListener("mouseleave", this.onMouseLeave);
        // Clean up any active resize operation
        if (this.isResizing) {
            window.removeEventListener("mousemove", this.onMouseMoveResize);
            window.removeEventListener("mouseup", this.onMouseUp);
            this.canvas.style.cursor = "default";
            document.body.style.cursor = "default";
        }
    }
}
