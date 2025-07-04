import { SelectionManager } from "./SelectionManager.js";
import { ResizeHandler } from "./resizeHandler.js";
import { RowResizeHandler } from "./rowResizeHandler.js";
import { RowMultiSelection } from "./RowMultiSelection.js";
import { ColumnSelectionHandler } from "./ColumnMultiSelectionHandler.js";
/**
 * Centralized handler manager that coordinates all grid interactions
 * Routes events to appropriate handlers based on mouse position and context
 */
export class GridHandlerManager {
    constructor(canvas, grid, undoManager) {
        // State tracking
        this.isHandlingOperation = false;
        this.operationType = 'none';
        this.lastMousePosition = { x: 0, y: 0 };
        this.canvas = canvas;
        this.grid = grid;
        this.undoManager = undoManager;
        // Initialize all handlers
        this.selectionManager = new SelectionManager(canvas, grid);
        this.resizeHandler = new ResizeHandler(canvas, grid, undoManager, this.selectionManager);
        this.rowResizeHandler = new RowResizeHandler(canvas, grid, undoManager, this.selectionManager);
        this.rowMultiSelection = new RowMultiSelection(canvas, grid, this.selectionManager);
        this.columnSelectionHandler = new ColumnSelectionHandler(canvas, grid, this.selectionManager);
        this.setupEventListeners();
    }
    /**
     * Sets up the main event listeners on the canvas
     */
    setupEventListeners() {
        // Remove existing listeners from individual handlers to prevent conflicts
        this.destroyIndividualHandlerListeners();
        // Add centralized listeners
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.canvas.addEventListener("click", this.handleClick.bind(this));
        this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
    }
    /**
     * Removes individual handler listeners to prevent conflicts
     */
    destroyIndividualHandlerListeners() {
        // Note: You might need to modify your individual handlers to expose 
        // their event listener functions or create destroy methods
        // For now, we'll work with the assumption that we control all events here
    }
    /**
     * Determines the appropriate handler based on mouse position
     */
    determineOperationType(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        // Store mouse position for reference
        this.lastMousePosition = { x, y };
        // Priority 1: Column resize (highest priority)
        if (this.resizeHandler.isInResizeZone(x, y)) {
            return 'column-resize';
        }
        // Priority 2: Row resize
        if (this.isInRowResizeZone(x, y)) {
            return 'row-resize';
        }
        // Priority 3: Column header selection
        if (this.isInColumnHeaderArea(x, y)) {
            return 'column-selection';
        }
        // Priority 4: Row header selection
        if (this.isInRowHeaderArea(x, y)) {
            return 'row-selection';
        }
        // Priority 5: Normal cell selection
        return 'cell-selection';
    }
    /**
     * Checks if mouse is in column header area
     */
    isInColumnHeaderArea(x, y) {
        const headerHeight = this.grid.rowHeights[0];
        const rowHeaderWidth = this.grid.colWidths[0];
        return y < headerHeight && x >= rowHeaderWidth;
    }
    /**
     * Checks if mouse is in row header area
     */
    isInRowHeaderArea(x, y) {
        const headerHeight = this.grid.rowHeights[0];
        const rowHeaderWidth = this.grid.colWidths[0];
        return x < rowHeaderWidth && y >= headerHeight;
    }
    /**
     * Checks if mouse is in row resize zone
     */
    isInRowResizeZone(x, y) {
        const rowHeaderWidth = this.grid.colWidths[0];
        if (x >= rowHeaderWidth)
            return false;
        const container = document.getElementById("container");
        const scrollTop = container.scrollTop;
        // Check if near any row border (within 5px)
        for (let i = 1; i < this.grid.totalRows; i++) {
            const rowTop = this.grid.getRowY(i);
            const rowHeight = this.grid.getRowHeight ? this.grid.getRowHeight(i) : this.grid.rowHeights[i];
            const relativeY = rowTop - scrollTop;
            const rowBottom = relativeY + rowHeight;
            if (y >= rowBottom - 5 && y <= rowBottom + 5) {
                return true;
            }
        }
        return false;
    }
    /**
     * Main mouse down handler that routes to appropriate handler
     */
    handleMouseDown(event) {
        // Prevent default to avoid text selection
        event.preventDefault();
        const operationType = this.determineOperationType(event);
        this.operationType = operationType;
        this.isHandlingOperation = true;
        // Route to appropriate handler based on type
        switch (operationType) {
            case 'column-resize':
                // Column resize is handled internally by ResizeHandler
                // We just need to trigger its mousedown logic
                this.triggerResizeHandlerMouseDown(event);
                break;
            case 'row-resize':
                // Row resize is handled internally by RowResizeHandler
                this.triggerRowResizeHandlerMouseDown(event);
                break;
            case 'column-selection':
                this.columnSelectionHandler.onMouseDown(event);
                break;
            case 'row-selection':
                this.rowMultiSelection.onMouseDown(event);
                break;
            case 'cell-selection':
            default:
                // Use SelectionManager's private method logic
                this.triggerSelectionManagerMouseDown(event);
                break;
        }
    }
    /**
     * Main mouse move handler
     */
    handleMouseMove(event) {
        // Update cursor if not currently handling an operation
        if (!this.isHandlingOperation) {
            this.updateCursor(event);
        }
        // Route to current operation handler
        switch (this.operationType) {
            case 'column-selection':
                this.columnSelectionHandler.onMouseMove(event);
                break;
            case 'row-selection':
                this.rowMultiSelection.onMouseMove(event);
                break;
            case 'cell-selection':
                this.triggerSelectionManagerMouseMove(event);
                break;
            // Note: Column and row resize are handled by their internal listeners
        }
    }
    /**
     * Main mouse up handler
     */
    handleMouseUp(event) {
        // Route to current operation handler
        switch (this.operationType) {
            case 'column-selection':
                this.columnSelectionHandler.onMouseUp(event);
                break;
            case 'row-selection':
                this.rowMultiSelection.onMouseUp(event);
                break;
            case 'cell-selection':
                this.triggerSelectionManagerMouseUp(event);
                break;
            // Note: Column and row resize are handled by their internal listeners
        }
        this.isHandlingOperation = false;
        this.operationType = 'none';
    }
    /**
     * Handle click events
     */
    handleClick(event) {
        // Only handle click if we're not in a drag operation
        if (!this.isHandlingOperation && this.operationType === 'none') {
            this.triggerSelectionManagerClick(event);
        }
    }
    /**
     * Handle mouse leave events
     */
    handleMouseLeave(event) {
        if (!this.isHandlingOperation) {
            this.canvas.style.cursor = "default";
        }
    }
    /**
     * Updates cursor based on mouse position
     */
    updateCursor(event) {
        const operationType = this.determineOperationType(event);
        let cursor = "default";
        switch (operationType) {
            case 'column-resize':
                cursor = "col-resize";
                break;
            case 'row-resize':
                cursor = "row-resize";
                break;
            case 'column-selection':
            case 'row-selection':
            case 'cell-selection':
                cursor = "default";
                break;
        }
        this.canvas.style.cursor = cursor;
    }
    // Helper methods to trigger handler methods (since they're private)
    // You might need to make these methods public in your handlers or create wrapper methods
    triggerResizeHandlerMouseDown(event) {
        // The ResizeHandler should handle this through its own event listeners
        // This is just a placeholder - you may need to expose methods or refactor
    }
    triggerRowResizeHandlerMouseDown(event) {
        // The RowResizeHandler should handle this through its own event listeners
        // This is just a placeholder - you may need to expose methods or refactor
    }
    triggerSelectionManagerMouseDown(event) {
        // Call the public method you'll add to SelectionManager
        this.selectionManager.handleMouseDown(event);
    }
    triggerSelectionManagerMouseMove(event) {
        // Call the public method you'll add to SelectionManager
        this.selectionManager.handleMouseMove(event);
    }
    triggerSelectionManagerMouseUp(event) {
        // Call the public method you'll add to SelectionManager
        this.selectionManager.handleMouseUp(event);
    }
    triggerSelectionManagerClick(event) {
        // Call the public method you'll add to SelectionManager
        this.selectionManager.handleClick(event);
    }
    /**
     * Gets current operation type for debugging
     */
    getCurrentOperationType() {
        return this.operationType;
    }
    /**
     * Check if currently handling an operation
     */
    isCurrentlyHandling() {
        return this.isHandlingOperation;
    }
    /**
     * Forces reset to default state
     */
    forceReset() {
        this.isHandlingOperation = false;
        this.operationType = 'none';
        this.canvas.style.cursor = "default";
    }
    /**
     * Cleanup method to remove all event listeners
     */
    destroy() {
        // Remove our centralized listeners
        this.canvas.removeEventListener("mousedown", this.handleMouseDown);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        this.canvas.removeEventListener("mouseup", this.handleMouseUp);
        this.canvas.removeEventListener("click", this.handleClick);
        this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
        // Destroy individual handlers
        this.selectionManager.destroy();
        this.resizeHandler.destroy();
        this.rowResizeHandler.destroy();
        // Note: Add destroy methods to RowMultiSelection and ColumnSelectionHandler if they don't exist
    }
}
// Usage example:
// const handlerManager = new GridHandlerManager(canvasElement, gridInstance, undoManagerInstance);
