import { SelectionManager } from "./SelectionManager.js";
import { ColumnSelectionHandler } from "./ColumnMultiSelectionHandler.js";
import { RowMultiSelection } from "./RowMultiSelection.js";
import { ResizeHandler } from "./resizeHandler.js";
import { RowResizeHandler } from "./rowResizeHandler.js";
/**
 * Coordinates all mouse events and delegates to appropriate handlers
 * to prevent conflicts between resizing and selection operations.
 */
export class MouseEventCoordinator {
    constructor(canvas, grid, undoManager) {
        this.canvas = canvas;
        this.grid = grid;
        this.undoManager = undoManager;
        // State tracking
        this.currentOperation = 'none';
        this.dragThreshold = 3; // pixels - minimum movement to start drag operation
        this.mouseDownPos = null;
        this.hasMoved = false;
        this.onMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.mouseDownPos = { x, y };
            this.hasMoved = false;
            this.currentOperation = 'none';
            const headerHeight = this.grid.getRowHeight(0);
            const rowHeaderWidth = this.grid.getColWidth(0);
            // Check for column resize zone first (highest priority)
            if (y <= headerHeight && this.isInColumnResizeZone(x, y)) {
                this.currentOperation = 'resize-column';
                this.resizeHandler.onMouseDown(e);
                return;
            }
            // Check for row resize zone
            if (x <= rowHeaderWidth && this.isInRowResizeZone(x, y)) {
                this.currentOperation = 'resize-row';
                this.rowResizeHandler.onMouseDown(e);
                return;
            }
            // For other areas, we'll determine the operation on mouse move or click
            // This allows us to differentiate between click and drag operations
        };
        this.onMouseMove = (e) => {
            if (!this.mouseDownPos) {
                // Handle cursor changes for resize zones when not dragging
                this.handleCursorChanges(e);
                return;
            }
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Check if mouse has moved beyond threshold
            if (!this.hasMoved) {
                const dx = Math.abs(x - this.mouseDownPos.x);
                const dy = Math.abs(y - this.mouseDownPos.y);
                if (dx > this.dragThreshold || dy > this.dragThreshold) {
                    this.hasMoved = true;
                    this.determineDragOperation(e);
                }
            }
            console.log(this.currentOperation);
            // Delegate to appropriate handler based on current operation
            switch (this.currentOperation) {
                case 'resize-column':
                    this.resizeHandler.onMouseMove(e);
                    break;
                case 'resize-row':
                    this.rowResizeHandler.onMouseMove(e);
                    break;
                case 'select-column':
                    this.columnSelectionHandler.onMouseMove(e);
                    console.log("selection of column started");
                    break;
                case 'select-row':
                    this.rowMultiSelection.onMouseMove(e);
                    break;
                case 'select-cells':
                    this.selectionManager.handleMouseMove(e);
                    break;
            }
        };
        this.onMouseUp = (e) => {
            // Delegate to appropriate handler
            // switch (this.currentOperation) {
            //   case 'resize-column':
            //     this.resizeHandler.onMouseUp(e);
            //     break;
            //   case 'resize-row':
            //     this.rowResizeHandler.onMouseUp(e);
            //     break;
            //   case 'select-column':
            //     console.log("multi selection");
            //     this.columnSelectionHandler.onMouseUp(e);
            //     break;
            //   case 'select-row':
            //     this.rowMultiSelection.onMouseUp(e);
            //     break;
            //   case 'select-cells':
            //     this.selectionManager.handleMouseUp(e);
            //     break;
            // }
            // Reset state
            this.mouseDownPos = null;
            this.hasMoved = false;
            this.currentOperation = 'none';
        };
        this.onClick = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (this.isInColumnResizeZone(x, y))
                return;
            // Only handle click if it wasn't a drag operation
            if (!this.hasMoved) {
                this.selectionManager.handleMouseDown(e);
            }
        };
        this.onKeyDown = (e) => {
            this.selectionManager.handleKeyDown(e);
        };
        this.onMouseLeave = (e) => {
            this.resizeHandler.onMouseLeave(e);
            this.rowResizeHandler.onMouseLeave(e);
        };
        // Initialize selection manager first
        this.selectionManager = new SelectionManager(canvas, grid);
        // Initialize handlers without their own event listeners
        this.resizeHandler = new ResizeHandler(canvas, grid, undoManager);
        this.rowResizeHandler = new RowResizeHandler(canvas, grid, undoManager, this.selectionManager);
        this.columnSelectionHandler = new ColumnSelectionHandler(canvas, grid, this.selectionManager);
        this.rowMultiSelection = new RowMultiSelection(canvas, grid, this.selectionManager);
        // Remove existing event listeners from handlers
        this.removeHandlerEventListeners();
        // Add our coordinated event listeners
        this.setupEventListeners();
    }
    removeHandlerEventListeners() {
        // Create temporary handlers to remove their listeners
        const tempResize = new ResizeHandler(this.canvas, this.grid, this.undoManager);
        const tempRowResize = new RowResizeHandler(this.canvas, this.grid, this.undoManager, this.selectionManager);
        const tempColumnSelect = new ColumnSelectionHandler(this.canvas, this.grid, this.selectionManager);
        const tempRowSelect = new RowMultiSelection(this.canvas, this.grid, this.selectionManager);
        const tempSelection = new SelectionManager(this.canvas, this.grid);
        // Destroy them to remove listeners
        tempResize.destroy();
        tempRowResize.destroy();
        tempColumnSelect.destroy();
        tempRowSelect.destroy();
        tempSelection.destroy();
    }
    setupEventListeners() {
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mouseleave", this.onMouseLeave);
        this.canvas.addEventListener("click", this.onClick);
        document.addEventListener("keydown", this.onKeyDown);
    }
    determineDragOperation(e) {
        if (this.currentOperation === 'resize-column' || this.currentOperation === 'resize-row') {
            return;
        }
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const headerHeight = this.grid.getRowHeight(0);
        const rowHeaderWidth = this.grid.getColWidth(0);
        if (this.isInColumnResizeZone(x, y))
            return;
        // Column header drag (excluding resize zones)
        if (y <= headerHeight && x >= rowHeaderWidth) {
            console.log("come inside");
            this.currentOperation = 'select-column';
            this.columnSelectionHandler.onMouseDown(this.createMouseEventAtPos(this.mouseDownPos));
        }
        // Row header drag (excluding resize zones)
        else if (x <= rowHeaderWidth && y >= headerHeight) {
            this.currentOperation = 'select-row';
            this.rowMultiSelection.onMouseDown(this.createMouseEventAtPos(this.mouseDownPos));
        }
        // Cell area drag
        else if (x >= rowHeaderWidth && y >= headerHeight) {
            this.currentOperation = 'select-cells';
            this.selectionManager.handleMouseDown(this.createMouseEventAtPos(this.mouseDownPos));
        }
    }
    handleCursorChanges(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const headerHeight = this.grid.getRowHeight(0);
        const rowHeaderWidth = this.grid.getColWidth(0);
        // Reset cursor first
        this.canvas.style.cursor = "default";
        // Check for column resize cursor
        if (y <= headerHeight && this.isInColumnResizeZone(x, y)) {
            this.canvas.style.cursor = "col-resize";
        }
        // Check for row resize cursor
        else if (x <= rowHeaderWidth && this.isInRowResizeZone(x, y)) {
            this.canvas.style.cursor = "row-resize";
        }
    }
    isInColumnResizeZone(x, y) {
        const headerHeight = this.grid.getRowHeight(0);
        if (y > headerHeight)
            return false;
        const container = document.getElementById("container");
        const scrollLeft = container.scrollLeft;
        const adjustedX = x + scrollLeft;
        let cumulativeX = 0;
        const tolerance = 5;
        for (let col = 0; col < this.grid.totalCols; col++) {
            const width = this.grid.getColWidth(col);
            const rightEdge = cumulativeX + width;
            if (Math.abs(adjustedX - rightEdge) <= tolerance) {
                return true;
            }
            cumulativeX += width;
            if (cumulativeX > adjustedX + this.canvas.clientWidth) {
                break;
            }
        }
        return false;
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
    createMouseEventAtPos(pos) {
        const rect = this.canvas.getBoundingClientRect();
        return new MouseEvent('mousedown', {
            clientX: rect.left + pos.x,
            clientY: rect.top + pos.y,
            bubbles: true,
            cancelable: true
        });
    }
    destroy() {
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
        this.canvas.removeEventListener("mouseleave", this.onMouseLeave);
        this.canvas.removeEventListener("click", this.onClick);
        document.removeEventListener("keydown", this.onKeyDown);
        // Clean up handlers
        this.resizeHandler.destroy();
        this.rowResizeHandler.destroy();
        this.columnSelectionHandler.destroy();
        this.rowMultiSelection.destroy();
        this.selectionManager.destroy();
    }
}
