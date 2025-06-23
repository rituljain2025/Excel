/**
 * Grid class responsible for rendering the Excel-like grid on the canvas
 */
export class Grid {
    constructor(ctx, canvas) {
        this.selectedColumn = null;
        this.selectedRow = null;
        // Cell range selection properties
        this.selectedCells = null;
        this.isDragging = false;
        this.dragStartRow = -1;
        this.dragStartCol = -1;
        this.colWidths = [];
        this.rowHeights = [];
        this.totalRows = 100000;
        this.totalCols = 500;
        this.cellData = new Map();
        this.ctx = ctx;
        this.canvas = canvas;
        for (let i = 0; i < this.totalCols; i++) {
            this.colWidths[i] = 100;
        }
        for (let i = 0; i < this.totalRows; i++) {
            this.rowHeights[i] = 25;
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const container = document.getElementById("container");
        container.addEventListener("scroll", () => {
            this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
        });
        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
        });
        // Add mouse event handlers for cell selection
        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.canvas.addEventListener("click", this.handleClick.bind(this));
        this.drawVisibleGrid(0, 0, window.innerWidth, window.innerHeight);
    }
    getColFromX(x) {
        let currentX = 0;
        for (let col = 0; col < this.totalCols; col++) {
            currentX += this.colWidths[col];
            if (x < currentX)
                return col;
        }
        return -1; // not found
    }
    getRowFromY(y) {
        let currentY = 0;
        for (let row = 0; row < this.totalRows; row++) {
            currentY += this.rowHeights[row];
            if (y < currentY)
                return row;
        }
        return -1; // not found
    }
    getCellFromCoordinates(x, y) {
        const container = document.getElementById("container");
        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;
        const adjustedX = x + scrollLeft;
        const adjustedY = y + scrollTop;
        const col = this.getColFromX(adjustedX);
        const row = this.getRowFromY(adjustedY);
        return { row, col };
    }
    redraw() {
        const container = document.getElementById("container");
        this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
    }
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const headerHeight = this.rowHeights[0];
        const rowHeaderWidth = this.colWidths[0];
        // Only handle cell selection in data area
        if (x >= rowHeaderWidth && y >= headerHeight) {
            const { row, col } = this.getCellFromCoordinates(x, y);
            if (row > 0 && col > 0 && row < this.totalRows && col < this.totalCols) {
                this.isDragging = true;
                this.dragStartRow = row;
                this.dragStartCol = col;
                // Clear previous selections when starting cell selection
                this.selectedColumn = null;
                this.selectedRow = null;
                this.selectedCells = {
                    startRow: row,
                    startCol: col,
                    endRow: row,
                    endCol: col
                };
                this.redraw();
            }
        }
        // Don't handle header clicks here - let the click event handle them
    }
    handleMouseMove(e) {
        if (!this.isDragging)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const headerHeight = this.rowHeights[0];
        const rowHeaderWidth = this.colWidths[0];
        if (x >= rowHeaderWidth && y >= headerHeight) {
            const { row, col } = this.getCellFromCoordinates(x, y);
            if (row > 0 && col > 0 && row < this.totalRows && col < this.totalCols) {
                if (this.selectedCells) {
                    // Update the selection range
                    this.selectedCells.startRow = Math.min(this.dragStartRow, row);
                    this.selectedCells.endRow = Math.max(this.dragStartRow, row);
                    this.selectedCells.startCol = Math.min(this.dragStartCol, col);
                    this.selectedCells.endCol = Math.max(this.dragStartCol, col);
                    this.redraw();
                }
            }
        }
    }
    handleMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            // Selection should persist after drag ends
            console.log("Selection completed:", this.selectedCells);
        }
    }
    handleClick(e) {
        // Only handle clicks if we're not dragging (to avoid interfering with drag selection)
        if (this.isDragging)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const container = document.getElementById("container");
        const scrollLeft = container.scrollLeft;
        const scrollTop = container.scrollTop;
        const headerHeight = this.rowHeights[0];
        const rowHeaderWidth = this.colWidths[0];
        // Check if clicked in the visible column header area
        if (y < headerHeight && x >= rowHeaderWidth) {
            // Clicked in column header area (excluding row header)
            // Clear cell selection when selecting column
            this.selectedCells = null;
            this.selectedRow = null;
            // Adjust x coordinate for scroll position to get the actual column
            const adjustedX = x + scrollLeft;
            const col = this.getColFromX(adjustedX);
            this.selectedColumn = (col > 0) ? col : null;
            this.redraw();
        }
        else if (x < rowHeaderWidth && y >= headerHeight) {
            // Clicked in row header area (excluding column header)
            // Clear cell selection when selecting row
            this.selectedCells = null;
            this.selectedColumn = null;
            // Adjust y coordinate for scroll position to get the actual row
            const adjustedY = y + scrollTop;
            const row = this.getRowFromY(adjustedY);
            this.selectedRow = (row > 0) ? row : null;
            this.redraw();
        }
        else if (x < rowHeaderWidth && y < headerHeight) {
            // Clicked in corner - clear all selections
            this.selectedCells = null;
            this.selectedColumn = null;
            this.selectedRow = null;
            this.redraw();
        }
        // If clicked in data area, cell selection is already handled by mousedown/drag
    }
    getColWidth(index) {
        return this.colWidths[index];
    }
    setColWidth(index, width) {
        if (width >= 30 && width <= 500) {
            this.colWidths[index] = width;
            const container = document.getElementById("container");
            this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
        }
    }
    getRowHeight(index) {
        return this.rowHeights[index];
    }
    setRowHeight(index, height) {
        if (height >= 20 && height <= 200) {
            this.rowHeights[index] = height;
            const container = document.getElementById("container");
            this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
        }
    }
    getColumnX(index) {
        let x = 0;
        for (let i = 0; i < index; i++) {
            x += this.colWidths[i];
        }
        return x;
    }
    getRowY(index) {
        let y = 0;
        for (let i = 0; i < index; i++) {
            y += this.rowHeights[i];
        }
        return y;
    }
    setCellData(row, col, value) {
        if (!this.cellData.has(row)) {
            this.cellData.set(row, new Map());
        }
        this.cellData.get(row).set(col, value);
        const container = document.getElementById("container");
        this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
    }
    getCellData(row, col) {
        return this.cellData.get(row)?.get(col);
    }
    // Get the currently selected cell range
    getSelectedRange() {
        return this.selectedCells;
    }
    // Clear all selections
    clearSelection() {
        this.selectedCells = null;
        this.selectedColumn = null;
        this.selectedRow = null;
        this.redraw();
    }
    getColumnLabel(colIndex) {
        let label = '';
        while (colIndex >= 0) {
            label = String.fromCharCode((colIndex % 26) + 65) + label;
            colIndex = Math.floor(colIndex / 26) - 1;
        }
        return label;
    }
    isCellInSelection(row, col) {
        if (!this.selectedCells)
            return false;
        return row >= this.selectedCells.startRow &&
            row <= this.selectedCells.endRow &&
            col >= this.selectedCells.startCol &&
            col <= this.selectedCells.endCol;
    }
    drawVisibleGrid(scrollTop, scrollLeft, viewWidth, viewHeight) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let y = 0;
        let startRow = 0, endRow = 0;
        for (let i = 0; i < this.totalRows; i++) {
            const h = this.rowHeights[i];
            if (y + h >= scrollTop && startRow === 0)
                startRow = i;
            if (y >= scrollTop + viewHeight) {
                endRow = i;
                break;
            }
            y += h;
        }
        if (endRow === 0)
            endRow = this.totalRows;
        let x = 0;
        let startCol = 0, endCol = 0;
        for (let j = 0; j < this.totalCols; j++) {
            const width = this.colWidths[j];
            if (x + width >= scrollLeft && startCol === 0)
                startCol = j;
            if (x >= scrollLeft + viewWidth) {
                endCol = j;
                break;
            }
            x += width;
        }
        if (endCol === 0)
            endCol = this.totalCols;
        this.ctx.font = "12px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        // Draw column headers
        const headerHeight = this.rowHeights[0];
        for (let j = startCol; j < endCol; j++) {
            const colX = this.getColumnX(j) - scrollLeft;
            const colW = this.colWidths[j];
            // Check if this column is selected
            const isSelectedColumn = this.selectedColumn === j && j > 0;
            this.ctx.fillStyle = isSelectedColumn ? "#0078d7" : "#f0f0f0"; // Dark blue if selected, light gray otherwise
            this.ctx.fillRect(colX, 0, colW, headerHeight);
            this.ctx.strokeStyle = "black";
            this.ctx.strokeRect(colX, 0, colW, headerHeight);
            this.ctx.fillStyle = isSelectedColumn ? "white" : "black"; // White text if selected, black otherwise
            if (j > 0) {
                const label = this.getColumnLabel(j - 1);
                this.ctx.fillText(label, colX + colW / 2, headerHeight / 2);
            }
        }
        // Draw rows and cells
        for (let i = startRow; i < endRow; i++) {
            const rowY = this.getRowY(i) - scrollTop;
            const rowH = this.rowHeights[i];
            // Check if this row is selected
            const isSelectedRow = this.selectedRow === i && i > 0;
            // Draw row headers
            const colWidth = this.colWidths[0];
            this.ctx.fillStyle = isSelectedRow ? "#0078d7" : "#f0f0f0"; // Dark blue if selected
            this.ctx.fillRect(0, rowY, colWidth, rowH);
            this.ctx.strokeStyle = "black";
            this.ctx.strokeRect(0, rowY, colWidth, rowH);
            this.ctx.fillStyle = isSelectedRow ? "white" : "black"; // White text if selected
            this.ctx.fillText(i.toString(), colWidth / 2, rowY + rowH / 2);
            // Draw data cells
            for (let j = startCol; j < endCol; j++) {
                if (j === 0)
                    continue;
                const colX = this.getColumnX(j) - scrollLeft;
                const colW = this.colWidths[j];
                // Check if this is the selected column or row
                const isSelectedColumn = this.selectedColumn === j && j > 0;
                const isCellSelected = this.isCellInSelection(i, j);
                // Fill background for selected cells, column or row cells
                if (isCellSelected) {
                    // Selected cell range - light blue background for inner area
                    this.ctx.fillStyle = "#cce7ff"; // Lighter blue for inner area
                    this.ctx.fillRect(colX, rowY, colW, rowH);
                }
                else if (isSelectedColumn || isSelectedRow) {
                    // Selected column or row - light blue background
                    this.ctx.fillStyle = "#e5f1fb";
                    this.ctx.fillRect(colX, rowY, colW, rowH);
                }
                this.ctx.strokeStyle = "black";
                this.ctx.strokeRect(colX, rowY, colW, rowH);
                // Draw cell data if available
                const rowData = this.cellData.get(i);
                if (rowData) {
                    const text = rowData.get(j);
                    if (text) {
                        this.ctx.fillStyle = "black"; // Always black text for better readability
                        this.ctx.fillText(text, colX + colW / 2, rowY + rowH / 2);
                    }
                }
            }
        }
        // Draw selection border for cell range
        if (this.selectedCells) {
            this.drawSelectionBorder(scrollTop, scrollLeft);
        }
    }
    drawSelectionBorder(scrollTop, scrollLeft) {
        if (!this.selectedCells)
            return;
        const { startRow, startCol, endRow, endCol } = this.selectedCells;
        const startX = this.getColumnX(startCol) - scrollLeft;
        const startY = this.getRowY(startRow) - scrollTop;
        const endX = this.getColumnX(endCol + 1) - scrollLeft;
        const endY = this.getRowY(endRow + 1) - scrollTop;
        const width = endX - startX;
        const height = endY - startY;
        // Draw thick dark border around selection
        this.ctx.strokeStyle = "#2B5AA0"; // Dark blue border
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(startX, startY, width, height);
        // Draw inner border for better definition
        this.ctx.strokeStyle = "#0078d7"; // Medium blue inner border
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(startX + 1, startY + 1, width - 2, height - 2);
        this.ctx.lineWidth = 1; // Reset line width
    }
    loadJsonData(data) {
        this.totalRows = data.length + 1; // +1 for header
        const container = document.getElementById("container");
        // Header
        const headers = Object.keys(data[0]);
        for (let col = 0; col < headers.length; col++) {
            this.setCellData(0, col + 1, headers[col]); // header row at i = 0, skipping col=0
        }
        // Data rows
        data.forEach((item, rowIndex) => {
            const actualRow = rowIndex + 1;
            Object.keys(item).forEach((key, i) => {
                this.setCellData(actualRow, i, item[key].toString()); // ID in column 0
            });
            // this.setCellData(actualRow, 1, item.firstName);
            // this.setCellData(actualRow, 2, item.lastName);
            // this.setCellData(actualRow, 3, item.Age.toString());
            // this.setCellData(actualRow, 4, item.Salary.toString());
        });
        // this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
    }
}
