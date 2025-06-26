export class SelectionManger {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        this.isDraggingColumn = false;
        this.dragStartColHeader = -1;
        this.dragEndColHeader = -1;
        this.canvas.addEventListener("onMouseDown", this.handleMouseDown);
    }
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const container = document.getElementById("container");
        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;
        const headerHeight = this.grid.rowHeights[0];
        const rowHeaderWidth = this.grid.colWidths[0];
        if (y < headerHeight && x >= rowHeaderWidth) {
            // Clicked in column header
            const adjustedX = x + scrollLeft;
            const col = this.grid.getColFromX(adjustedX);
            if (col > 0) {
                this.isDraggingColumn = true;
                this.dragStartColHeader = col;
                this.dragEndColHeader = col;
                this.grid.selectedCells = {
                    startRow: 1,
                    endRow: this.grid.totalRows - 1,
                    startCol: col,
                    endCol: col
                };
                this.grid.redraw();
            }
            return;
        }
    }
}
