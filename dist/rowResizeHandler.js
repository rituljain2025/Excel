export class RowResizeHandler {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        this.isResizing = false;
        this.startY = 0;
        this.startHeight = 0;
        this.targetRow = -1;
        this.onMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const container = document.getElementById("container");
            const scrollTop = container.scrollTop;
            let accumulatedY = 0;
            for (let i = 0; i < this.grid.totalRows; i++) {
                const rowTop = this.grid.getRowY(i);
                const rowHeight = this.grid.getRowHeight(i);
                const relativeY = rowTop - scrollTop;
                if (Math.abs(y - (relativeY + rowHeight)) < 5) {
                    this.isResizing = true;
                    this.startY = y;
                    this.startHeight = rowHeight;
                    this.targetRow = i;
                    document.body.style.cursor = "row-resize";
                    window.addEventListener("mousemove", this.onMouseMove);
                    window.addEventListener("mouseup", this.onMouseUp);
                    break;
                }
                if (relativeY > this.canvas.height)
                    break;
            }
        };
        this.onMouseMove = (e) => {
            if (!this.isResizing)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const currentY = e.clientY - rect.top;
            const delta = currentY - this.startY;
            const newHeight = this.startHeight + delta;
            if (newHeight >= 20 && newHeight <= 200) {
                this.grid.setRowHeight(this.targetRow, newHeight);
            }
        };
        this.onMouseUp = () => {
            this.isResizing = false;
            this.targetRow = -1;
            document.body.style.cursor = "default";
            window.removeEventListener("mousemove", this.onMouseMove);
            window.removeEventListener("mouseup", this.onMouseUp);
        };
        this.canvas.addEventListener("mousedown", this.onMouseDown);
    }
}
