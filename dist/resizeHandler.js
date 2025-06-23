// import { Grid } from './grid.js';
export class ResizeHandler {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        this.isResizing = false;
        this.startX = 0;
        this.startWidth = 0;
        this.resizingColIndex = -1;
        this.onMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            let cumulativeX = 0;
            for (let col = 0; col < 500; col++) {
                const width = this.grid.getColWidth(col);
                // Check if mouse is within 5px of the right edge of this column
                if (Math.abs(x - (cumulativeX + width)) < 5) {
                    this.isResizing = true;
                    this.resizingColIndex = col;
                    this.startX = x;
                    this.startWidth = width;
                    document.body.style.cursor = "col-resize";
                    window.addEventListener("mousemove", this.onMouseMove);
                    window.addEventListener("mouseup", this.onMouseUp);
                    return;
                }
                cumulativeX += width;
                // Stop checking if we've passed the visible area
                if (cumulativeX > this.canvas.width)
                    break;
            }
        };
        this.onMouseMove = (e) => {
            if (!this.isResizing || this.resizingColIndex === -1)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const delta = currentX - this.startX;
            const newWidth = this.startWidth + delta;
            if (newWidth >= 30 && newWidth <= 500) {
                this.grid.setColWidth(this.resizingColIndex, newWidth);
            }
        };
        this.onMouseUp = () => {
            this.isResizing = false;
            this.resizingColIndex = -1;
            document.body.style.cursor = "default";
            window.removeEventListener("mousemove", this.onMouseMove);
            window.removeEventListener("mouseup", this.onMouseUp);
        };
        this.canvas.addEventListener("mousedown", this.onMouseDown);
    }
}
