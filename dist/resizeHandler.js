import { ResizeColumnCommand } from './commands/ResizeColumnCommand.js';
import { MultiCommand } from './commands/command.js';
/**
 * Handles resizing of columns in the grid when the user drags near column edges.
 */
export class ResizeHandler {
    /**
     * @param canvas HTML canvas where the grid is drawn
     * @param grid Grid instance to manipulate column widths
     * @param undoManager UndoManager to support undo/redo functionality
     */
    constructor(canvas, grid, undoManager) {
        this.canvas = canvas;
        this.grid = grid;
        this.undoManager = undoManager;
        /** Whether a resize operation is in progress */
        this.isResizing = false;
        /** X-coordinate where resize started */
        this.startX = 0;
        /** Original width of the column before resizing */
        this.startWidth = 0;
        /** Index of the column being resized */
        this.resizingColIndex = -1;
        /** Whether mouse is hovering near a resizable border */
        this.isHovering = false;
        /** Final width during active resize drag (used for undo command) */
        this.currentNewWidth = 0;
        this.isMultiColResize = false;
        /**
         * Handles mouse down event to initiate resizing if user clicks near column edge
         */
        this.onMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left);
            const y = (e.clientY - rect.top);
            if (!this.isInColumnHeader(y))
                return;
            const border = this.findResizableBorder(x);
            if (border) {
                // Determine if multi-column resize should be enabled
                let isMultiColSelected = false;
                if (this.grid.selectionMode === "column" &&
                    this.grid.selectedCells &&
                    this.grid.selectedCells.startCol !== this.grid.selectedCells.endCol &&
                    border.col >= this.grid.selectedCells.startCol &&
                    border.col <= this.grid.selectedCells.endCol) {
                    isMultiColSelected = true;
                }
                this.canvas._isResizing = true;
                this.isResizing = true;
                this.resizingColIndex = border.col;
                this.startX = x;
                this.startWidth = this.grid.getColWidth(border.col);
                this.canvas.style.cursor = "col-resize";
                this.isMultiColResize = isMultiColSelected;
                window.addEventListener("mousemove", this.onMouseMoveResize);
                window.addEventListener("mouseup", this.onMouseUp);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        };
        /**
         * Handles active resizing as user drags the mouse
         */
        this.onMouseMoveResize = (e) => {
            if (!this.isResizing || this.resizingColIndex === -1)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const currentX = (e.clientX - rect.left);
            const delta = currentX - this.startX;
            const newWidth = this.startWidth + delta;
            if (newWidth >= 30 && newWidth <= 500) {
                if (this.isMultiColResize && this.grid.selectedCells) {
                    // Multi-column resize: update all selected columns visually during drag
                    for (let col = this.grid.selectedCells.startCol; col <= this.grid.selectedCells.endCol; col++) {
                        this.grid.setColWidth(col, newWidth);
                    }
                }
                else {
                    // Single column resize
                    this.grid.setColWidth(this.resizingColIndex, newWidth);
                }
                this.currentNewWidth = newWidth;
            }
        };
        /**
         * Ends the resize operation and registers undo command
         */
        this.onMouseUp = () => {
            if (this.isResizing) {
                this.canvas._isResizing = false;
                const colIndex = this.resizingColIndex;
                const oldWidth = this.startWidth;
                const newWidth = this.currentNewWidth;
                this.isResizing = false;
                this.resizingColIndex = -1;
                this.currentNewWidth = 0;
                if (oldWidth !== newWidth && newWidth >= 30 && newWidth <= 500) {
                    if (this.isMultiColResize && this.grid.selectedCells) {
                        // Only multi-resize if pointer down was on multi-selected area
                        const commands = [];
                        for (let col = this.grid.selectedCells.startCol; col <= this.grid.selectedCells.endCol; col++) {
                            this.grid.setColWidth(col, newWidth);
                            commands.push(new ResizeColumnCommand(this.grid, col, newWidth));
                        }
                        this.undoManager.executeCommand(new MultiCommand(commands));
                        setTimeout(() => {
                            this.grid.selectedCells = {
                                startRow: this.grid.selectedCells.startRow,
                                endRow: this.grid.selectedCells.endRow,
                                startCol: this.grid.selectedCells.startCol,
                                endCol: this.grid.selectedCells.endCol
                            };
                            this.grid.redraw();
                        }, 0);
                    }
                    else {
                        this.grid.setColWidth(colIndex, oldWidth); // reset for undo consistency
                        const cmd = new ResizeColumnCommand(this.grid, colIndex, newWidth);
                        this.undoManager.executeCommand(cmd);
                    }
                }
                this.canvas.style.cursor = "default";
                document.body.style.cursor = "default";
                this.isHovering = false;
                window.removeEventListener("mousemove", this.onMouseMoveResize);
                window.removeEventListener("mouseup", this.onMouseUp);
            }
        };
        /**
         * Handles normal mouse movement to show resize cursor near column edges
         */
        this.onMouseMove = (e) => {
            if (this.isResizing)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left);
            const y = (e.clientY - rect.top);
            if (!this.isInColumnHeader(y)) {
                if (this.isHovering) {
                    this.canvas.style.cursor = "default";
                    this.isHovering = false;
                }
                return;
            }
            const border = this.findResizableBorder(x);
            if (border) {
                if (!this.isHovering) {
                    this.canvas.style.cursor = "col-resize";
                    this.isHovering = true;
                }
            }
            else {
                if (this.isHovering) {
                    this.canvas.style.cursor = "default";
                    this.isHovering = false;
                }
            }
        };
    }
    /**
     * Checks if the y-position is within the column header area
     */
    isInColumnHeader(y) {
        const headerHeight = this.grid.getRowHeight(0);
        return y >= 0 && y <= headerHeight;
    }
    /**
     * Finds the column border that's closest to the mouse position for resizing
     */
    findResizableBorder(x) {
        const container = document.getElementById("container");
        const scrollLeft = container.scrollLeft;
        const adjustedX = x + scrollLeft;
        let cumulativeX = 0;
        const totalCols = this.grid.totalCols || 500;
        const tolerance = 5; // pixels
        for (let col = 0; col < totalCols; col++) {
            const width = this.grid.getColWidth(col);
            const rightEdge = cumulativeX + width;
            // Check if mouse is near the right edge of this column
            if (Math.abs(adjustedX - rightEdge) <= tolerance) {
                return {
                    col,
                    borderX: rightEdge - scrollLeft
                };
            }
            cumulativeX += width;
            // Early break optimization: if we're way past the visible area, stop
            if (cumulativeX > adjustedX + this.canvas.clientWidth) {
                break;
            }
        }
        return null;
    }
    getCursor(x, y) {
        return "col-resize";
    }
    hitTest(x, y) {
        if (!this.isInColumnHeader(y))
            return false;
        return this.findResizableBorder(x) !== null;
    }
}
