export class RowMultiSelection {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        this.isDragging = false;
        this.dragStartRow = -1;
        this.dragEndRow = -1;
        this.onMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const container = document.getElementById("container");
            const scrollTop = container?.scrollTop;
            const headerWidth = this.grid.getColWidth(0);
            const headerHeight = this.grid.getRowHeight(0);
            if (x < headerWidth && y >= headerHeight) {
                const adjustedY = y + scrollTop;
                const row = this.grid.getRowFromY(adjustedY);
                if (row > 0) {
                    this.isDragging = true;
                    this.dragStartRow = this.dragEndRow = row;
                    this.grid.clearSelection();
                    this.grid.setRowRangeSelection(this.dragStartRow, this.dragEndRow);
                    this.grid.redraw();
                }
            }
        };
        this.onMouseMove = (e) => {
            if (!this.isDragging)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const container = document.getElementById("container");
            const scrollTop = container.scrollTop;
            const adjustedY = y + scrollTop;
            const row = this.grid.getRowFromY(adjustedY);
            if (row > 0) {
                this.dragEndRow = row;
                const start = Math.min(this.dragStartRow, this.dragEndRow);
                const end = Math.max(this.dragStartRow, this.dragEndRow);
                this.grid.setRowRangeSelection(this.dragStartRow, this.dragEndRow);
                this.grid.redraw();
            }
        };
        this.onMouseUp = (e) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.grid.suppressNextHeaderClick();
            }
        };
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
    }
}
