// HandlerManager.ts
import { SelectionManager } from "./SelectionManager.js";
import { ColumnSelectionHandler } from "./ColumnMultiSelectionHandler.js";
import { RowMultiSelection } from "./RowMultiSelection.js";
import { ResizeHandler } from "./resizeHandler.js";
import { RowResizeHandler } from "./rowResizeHandler.js";
export class HandlerManager {
    constructor(canvas, grid, undoManager) {
        this.canvas = canvas;
        this.grid = grid;
        this.undoManager = undoManager;
        this.currentHandler = null;
        this.currentType = "none";
        this.onMouseDown = (e) => {
            const type = this.determineHandlerType(e);
            if (type !== this.currentType) {
                this.switchHandler(type);
            }
            if (this.currentHandler && this.currentHandler.onMouseDown) {
                this.currentHandler.onMouseDown(e);
            }
        };
        this.onMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (this.isInColumnResizeZone(x, y)) {
                this.canvas.style.cursor = "col-resize";
            }
            else if (this.isInRowResizeZone(x, y)) {
                this.canvas.style.cursor = "row-resize";
            }
            else {
                this.canvas.style.cursor = "cell";
            }
            if (this.currentHandler && this.currentHandler.onMouseMove) {
                this.currentHandler.onMouseMove(e);
            }
        };
        this.onMouseUp = (e) => {
            if (this.currentHandler && this.currentHandler.onMouseUp) {
                this.currentHandler.onMouseUp(e);
            }
        };
        this.onMouseLeave = (e) => {
            if (this.currentHandler && this.currentHandler.onMouseLeave) {
                this.currentHandler.onMouseLeave(e);
            }
        };
        this.attach();
    }
    attach() {
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
        this.canvas.addEventListener("mouseleave", this.onMouseLeave);
    }
    switchHandler(type) {
        if (this.currentHandler && this.currentHandler.destroy) {
            this.currentHandler.destroy();
        }
        this.currentType = type;
        switch (type) {
            case "resize-column":
                this.currentHandler = new ResizeHandler(this.canvas, this.grid, this.undoManager);
                break;
            case "resize-row":
                this.currentHandler = new RowResizeHandler(this.canvas, this.grid, this.undoManager);
                break;
            case "select-column":
                this.currentHandler = new ColumnSelectionHandler(this.canvas, this.grid);
                break;
            case "select-row":
                this.currentHandler = new RowMultiSelection(this.canvas, this.grid);
                break;
            case "select-cells":
                this.currentHandler = new SelectionManager(this.canvas, this.grid);
                break;
            default:
                this.currentHandler = null;
        }
    }
    determineHandlerType(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const headerHeight = this.grid.getRowHeight(0);
        const rowHeaderWidth = this.grid.getColWidth(0);
        if (y <= headerHeight && this.isInColumnResizeZone(x, y)) {
            return "resize-column";
        }
        if (x <= rowHeaderWidth && this.isInRowResizeZone(x, y)) {
            return "resize-row";
        }
        if (y <= headerHeight && x >= rowHeaderWidth) {
            return "select-column";
        }
        if (x <= rowHeaderWidth && y >= headerHeight) {
            return "select-row";
        }
        if (x >= rowHeaderWidth && y >= headerHeight) {
            return "select-cells";
        }
        return "none";
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
}
