export class MouseEventManager {
    constructor(canvas, grid, resizeHandler, rowResizeHandler, selectionManager, columnSelectionHandler, rowMultiSelection) {
        this.canvas = canvas;
        this.grid = grid;
        this.resizeHandler = resizeHandler;
        this.rowResizeHandler = rowResizeHandler;
        this.selectionManager = selectionManager;
        this.columnSelectionHandler = columnSelectionHandler;
        this.rowMultiSelection = rowMultiSelection;
        this.onMouseDown = (e) => {
            const pos = this.getPointerPosition(e);
            const isColEdge = this.resizeHandler.isInResizeZone(pos.x, pos.y);
            const isRowEdge = this.rowResizeHandler.isInResizeZone?.(pos.x, pos.y); // Optional: add method
            if (isColEdge) {
                this.resizeHandler.onMouseDown(e);
            }
            else if (isRowEdge) {
                this.rowResizeHandler.onMouseDown(e);
            }
            else if (this.isInColumnHeader(pos)) {
                this.columnSelectionHandler.onMouseDown(e);
            }
            else if (this.isInRowHeader(pos)) {
                this.rowMultiSelection.onMouseDown(e);
            }
            else {
                this.selectionManager.handleMouseDown(e);
            }
        };
        this.onMouseMove = (e) => {
            // Let handlers internally check if they’re dragging/resizing
            this.resizeHandler.onMouseMove(e);
            this.rowResizeHandler.onMouseMove(e);
            this.selectionManager.handleMouseMove(e);
            this.columnSelectionHandler.onMouseMove(e);
            this.rowMultiSelection.onMouseMove(e);
        };
        this.onMouseUp = (e) => {
            this.resizeHandler.onMouseUp?.(e);
            this.rowResizeHandler.onMouseUp?.(e);
            this.selectionManager.handleMouseUp(e);
            this.columnSelectionHandler.onMouseUp(e);
            this.rowMultiSelection.onMouseUp(e);
        };
        this.attachListeners();
    }
    attachListeners() {
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
    }
    getPointerPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }
    isInColumnHeader(pos) {
        return pos.y < this.grid.getRowHeight(0) && pos.x >= this.grid.getColWidth(0);
    }
    isInRowHeader(pos) {
        return pos.x < this.grid.getColWidth(0) && pos.y >= this.grid.getRowHeight(0);
    }
    destroy() {
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
    }
}
