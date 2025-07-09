export class HeaderClick {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        this.onMouseDown = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const y = (e.clientY - rect.top) / this.grid.zoom;
            const x = (e.clientX - rect.left) / this.grid.zoom;
            const container = document.getElementById("container");
            const scrollTop = container.scrollTop;
            const scrollLeft = container.scrollLeft;
            const headerHeight = this.grid.getRowHeight(0);
            const rowHeaderWidth = this.grid.getColWidth(0);
            // Row header click
            if (x < rowHeaderWidth && y >= headerHeight) {
                let currentY = 0;
                for (let i = 0; i < this.grid.totalRows; i++) {
                    const rowHeight = this.grid.getRowHeight(i);
                    if (y >= currentY - scrollTop && y <= currentY + rowHeight - scrollTop) {
                        this.grid.setSelectedRow(i);
                        this.grid.redraw();
                        break;
                    }
                    currentY += rowHeight;
                }
            }
            // Column header click
            else if (y < headerHeight && x >= rowHeaderWidth) {
                let currentX = 0;
                for (let j = 0; j < this.grid.totalCols; j++) {
                    const colWidth = this.grid.getColWidth(j);
                    if (x >= currentX - scrollLeft && x <= currentX + colWidth - scrollLeft) {
                        this.grid.setSelectedColumn(j);
                        this.grid.redraw();
                        break;
                    }
                    currentX += colWidth;
                }
            }
        };
    }
    isInHeaderClickZone(x, y) {
        const headerHeight = this.grid.getRowHeight(0);
        const rowHeaderWidth = this.grid.getColWidth(0);
        return ((y < headerHeight && x >= rowHeaderWidth) || // Column header
            (x < rowHeaderWidth && y >= headerHeight) // Row header
        );
    }
}
