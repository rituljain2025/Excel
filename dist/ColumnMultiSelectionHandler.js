export class ColumnSelectionHandler {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        this.isDragging = false;
        this.startCol = -1;
        this.endCol = -1;
        this.onMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const container = document.getElementById("container");
            const scrollLeft = container.scrollLeft;
            const headerHeight = this.grid.getRowHeight(0);
            const rowHeaderWidth = this.grid.getColWidth(0);
            // Only trigger if clicking on the column header (not row header)
            if (y < headerHeight && x >= rowHeaderWidth) {
                const adjustedX = x + scrollLeft;
                const col = this.grid.getColFromX(adjustedX);
                if (col > 0) {
                    this.isDragging = true;
                    this.startCol = this.endCol = col;
                    this.grid.clearSelection();
                    this.grid.setColumnRangeSelection(this.startCol, this.endCol);
                    this.grid.redraw();
                }
            }
        };
        this.onMouseMove = (e) => {
            if (!this.isDragging)
                return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const container = document.getElementById("container");
            const scrollLeft = container.scrollLeft;
            const adjustedX = x + scrollLeft;
            const col = this.grid.getColFromX(adjustedX);
            if (col > 0) {
                this.endCol = col;
                const start = Math.min(this.startCol, this.endCol);
                const end = Math.max(this.startCol, this.endCol);
                this.grid.setColumnRangeSelection(start, end);
                this.grid.redraw();
            }
        };
        this.onMouseUp = (_e) => {
            if (this.isDragging) {
                this.isDragging = false;
                this.grid.suppressNextHeaderClick();
                console.log("Column range selected:", this.startCol, "to", this.endCol);
            }
        };
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
    }
}
