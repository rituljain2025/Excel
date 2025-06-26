
export class Grid {
  private selectedColumn: number | null = null;
  private selectedRow: number | null = null;
  
  // Cell range selection properties
  private selectedCells: {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } | null = null;
  private suppressHeaderClick: boolean = false;
  private isDragging: boolean = false;
  private dragStartRow: number = -1;
  private dragStartCol: number = -1;
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private dpr: number;
 
  private colWidths: number[] = [];
  private rowHeights: number[] = [];

  public totalRows: number = 1000000;
  public totalCols: number = 5000;
  private cellData: Map<number, Map<number, string>> = new Map();
  private lastRowHeaderWidth: number = 0;
  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.dpr = window.devicePixelRatio || 1;

    let spacerHeight :number= 0;
    let spacerWidth :number = 0;
   
    for (let i = 0; i < this.totalCols; i++) {
      this.colWidths[i] = 80;
      spacerWidth += this.colWidths[i];
    }
    for (let i = 0; i < this.totalRows; i++) {
      this.rowHeights[i] = 25;
      spacerHeight += this.rowHeights[i];
    }
    const spacer = document.getElementById("spacer")!;
    spacer.style.height = spacerHeight+"px";
    spacer.style.width = spacerWidth + "px";
    this.setupCanvas();

    const container = document.getElementById("container")!;

    container.addEventListener("scroll", () => {
      this.drawVisibleGrid(
        container.scrollTop,
        container.scrollLeft,
        container.clientWidth,
        container.clientHeight
      );
    });
  
    
    window.addEventListener("resize", () => {
      this.setupCanvas();
      this.redraw();
    });
    
    

    // Add mouse event handlers for cell selection
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("click", this.handleClick.bind(this));
    
    this.drawVisibleGrid(0, 0, window.innerWidth, window.innerHeight);
  }


  private setupCanvas(): void {
    const rect = this.canvas.getBoundingClientRect();
    
    // Set the actual size in memory (scaled up for high DPI)
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    
    // Scale the canvas back down using CSS
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    // Scale the drawing context so everything is drawn at the correct size
    this.ctx.scale(this.dpr, this.dpr);
  }
 
  private drawCrispLine(x1: number, y1: number, x2: number, y2: number): void {
    // Offset by 0.5 pixels to get crisp 1px lines
    const offset = 0.5;
    this.ctx.lineWidth = 1 / this.dpr;
    this.ctx.beginPath();

    if (x1 === x2) {
      // Vertical line
      const crispX = Math.round(x1) + offset;
      this.ctx.moveTo(crispX, y1);
      this.ctx.lineTo(crispX, y2);
  
    } else {
      // Horizontal line
      const crispY = Math.round(y1) + offset;
      this.ctx.moveTo(x1, crispY);
      this.ctx.lineTo(x2, crispY);
    }
    this.ctx.stroke();
  }
 
  private drawCrispRect(x: number, y: number, width: number, height: number, fill: boolean = false): void {
    const offset = 0.5;
    const crispX = Math.round(x) + offset;
    const crispY = Math.round(y) + offset;
    const crispWidth = Math.round(width) - 1 / this.dpr;
    const crispHeight = Math.round(height) - 1 / this.dpr;
    
    if (fill) {
      this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    }
    
    this.ctx.strokeRect(crispX, crispY, crispWidth, crispHeight);
  }

  public computeSelectedCellStats(): {
    count: number;
    min: number | null;
    max: number | null;
    sum: number;
    avg: number | null;
  } {
    if (!this.selectedCells) return { count: 0, min: null, max: null, sum: 0, avg: null };

    const { startRow, endRow, startCol, endCol } = this.selectedCells;

    let numbers: number[] = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const val = this.getCellData(row, col);
        if (val !== undefined && !isNaN(Number(val))) {
          numbers.push(Number(val));
        }
      }
    }

    const count = numbers.length;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const min = count > 0 ? Math.min(...numbers) : null;
    const max = count > 0 ? Math.max(...numbers) : null;
    const avg = count > 0 ? sum / count : null;

    return { count, min, max, sum, avg };
  }
  
  //returns which column is located at the horzionatal position
  public getColFromX(x: number): number {
    let currentX = 0;
    for (let col = 0; col < this.totalCols; col++) {
      currentX += this.colWidths[col];
      if (x < currentX) return col;
    }
    return -1; // not found
  }

  public getRowFromY(y: number): number {
    let currentY = 0;
    for (let row = 0; row < this.totalRows; row++) {
      currentY += this.rowHeights[row];
      if (y < currentY) return row;
    }
    return -1; // not found
  }
  
  private getCellFromCoordinates(x: number, y: number): { row: number, col: number } {
    const container = document.getElementById("container")!;
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const adjustedX = x + scrollLeft;
    const adjustedY = y + scrollTop;

    const col = this.getColFromX(adjustedX);
    const row = this.getRowFromY(adjustedY);

    return { row, col };
  }

  public redraw(): void {
    const container = document.getElementById("container")!;
    this.drawVisibleGrid(
      container.scrollTop,
      container.scrollLeft,
      container.clientWidth,
      container.clientHeight
    );
  }

  private handleMouseDown(e: MouseEvent): void {
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
   
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;

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

  private handleMouseUp(e: MouseEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      // Selection should persist after drag ends
      console.log("Selection completed:", this.selectedCells);
    }
  }

  private handleClick(e: MouseEvent): void {
    // Only handle clicks if we're not dragging (to avoid interfering with drag selection)
    if (this.isDragging) return;
    if (this.isDragging || this.suppressHeaderClick) {
      this.suppressHeaderClick = false;
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const container = document.getElementById("container")!;
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
    } else if (x < rowHeaderWidth && y >= headerHeight) {
      // Clicked in row header area (excluding column header)
      // Clear cell selection when selecting row
      this.selectedCells = null;
      this.selectedColumn = null;
      
      // Adjust y coordinate for scroll position to get the actual row
      const adjustedY = y + scrollTop;
      const row = this.getRowFromY(adjustedY);
      this.selectedRow = (row > 0) ? row : null;
      this.redraw();
    } else if (x < rowHeaderWidth && y < headerHeight) {
      // Clicked in corner - clear all selections
      this.selectedCells = null;
      this.selectedColumn = null;
      this.selectedRow = null;
      this.redraw();
    }
    // If clicked in data area, cell selection is already handled by mousedown/drag
  }

  public getColWidth(index: number): number {
    return this.colWidths[index];
  }

  public setColWidth(index: number, width: number): void {
    if (width >= 30 && width <= 500) {
      this.colWidths[index] = width;
      this.redraw();
    }
  }

  public getRowHeight(index: number): number {
    return this.rowHeights[index];
  }

  public setRowHeight(index: number, height: number): void {
    if (height >= 20 && height <= 200) {
      this.rowHeights[index] = height;
      this.redraw();
    }
  }
  

  //How far this col is from left
  public getColumnX(index: number): number {
    let x = 0;
    for (let i = 0; i < index; i++) {
      x += this.colWidths[i];
    }
    return x;
  }
  
  //To find how far row is from top
  public getRowY(index: number): number {
    let y = 0;
    for (let i = 0; i < index; i++) {
      y += this.rowHeights[i];
    }
    return y;
  }

  public setCellData(row: number, col: number, value: string): void {
    if (!this.cellData.has(row)) {
      this.cellData.set(row, new Map());
    }
    this.cellData.get(row)!.set(col, value);
    
  }

  public getCellData(row: number, col: number): string | undefined {
    return this.cellData.get(row)?.get(col);
  }

  // Get the currently selected cell range
  public getSelectedRange(): { startRow: number; startCol: number; endRow: number; endCol: number } | null {
    return this.selectedCells;
  }

  // Clear all selections
  public clearSelection(): void {
    this.selectedCells = null;
    this.selectedColumn = null;
    this.selectedRow = null;
    this.redraw();
  }

  private getColumnLabel(colIndex: number): string {
    let label = '';
    while (colIndex >= 0) {
      label = String.fromCharCode((colIndex % 26) + 65) + label;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return label;
  }

  private isCellInSelection(row: number, col: number): boolean {
    if (!this.selectedCells) return false;
    
    return row >= this.selectedCells.startRow && 
           row <= this.selectedCells.endRow && 
           col >= this.selectedCells.startCol && 
           col <= this.selectedCells.endCol;
  }
  
  //Main function for cell , row and column
  private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {

    // Four argument it take left, top,width and height and clears portion
    this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
    
    //Finding which rows are currently visible
    let y = 0;
    let startRow = 0, endRow = 0;
    for (let i = 0; i < this.totalRows; i++) {
      const h = this.rowHeights[i];
      if (y + h >= scrollTop && startRow === 0) startRow = i;
      if (y >= scrollTop + viewHeight) {
        endRow = i;
        break;
      }
      y += h;
    }
    if (endRow === 0) endRow = this.totalRows;
    

    //Finding which columns are currently visible
    let x = 0;
    let startCol = 0, endCol = 0;
    for (let j = 0; j < this.totalCols; j++) {
      const width = this.colWidths[j];
      if (x + width >= scrollLeft && startCol === 0) startCol = j;
      if (x >= scrollLeft + viewWidth) {
        endCol = j;
        break;
      }
      x += width;
    }
    if (endCol === 0) endCol = this.totalCols;


    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.lineWidth = 1 / this.dpr;
    

    //  Step 1: Draw only cell data (excluding headers) 
    for (let i = Math.max(startRow, 1); i < endRow; i++) {
      const rowY = this.getRowY(i) - scrollTop;
      const rowH = this.rowHeights[i];
      const isSelectedRow = this.selectedRow === i;
      
      for (let j = Math.max(startCol, 1); j < endCol; j++) {
        const colX = this.getColumnX(j) - scrollLeft;
        const colW = this.colWidths[j];
        const isSelectedColumn = this.selectedColumn === j;
        const isCellSelected = this.isCellInSelection(i, j);

        if (isCellSelected) {
          this.ctx.fillStyle = "white";
          this.ctx.fillRect(colX, rowY, colW, rowH);
        } else if (isSelectedColumn || isSelectedRow) {
          this.ctx.fillStyle = "#e7f2eb";
          this.ctx.fillRect(colX, rowY, colW, rowH);
        }

        // Cell borders
        this.ctx.strokeStyle = "#e0e0e0";
        this.drawCrispLine(colX, rowY, colX + colW, rowY); //top border
        this.drawCrispLine(colX, rowY + rowH, colX + colW, rowY + rowH); //bottom border
        this.drawCrispLine(colX, rowY, colX, rowY + rowH); //left border
        this.drawCrispLine(colX + colW, rowY, colX + colW, rowY + rowH); //right border


        // Cell data
        const rowData = this.cellData.get(i);
        const text = rowData?.get(j);
        if (text) {
          this.ctx.fillStyle = "black";
          this.ctx.fillText(text, colX + colW / 2, rowY + rowH / 2);
        }
      }
    }
    
    // Step 2: Draw row headers (first column) - Excel-style dynamic width
    const requiredWidth = this.calculateRowHeaderWidth(startRow, endRow);

    // Only update width if it changed significantly to avoid constant redraws
    if (Math.abs(this.colWidths[0] - requiredWidth) > 2) {
      this.colWidths[0] = requiredWidth;
      this.lastRowHeaderWidth = requiredWidth;
      
      // Redraw to apply new width (only if width actually changed)
      setTimeout(() => this.redraw(), 0);
      return;
    }
    // Step 2: Draw row headers (first column) 
    for (let i = startRow; i < endRow; i++) {
 
      const rowY = this.getRowY(i) - scrollTop;
      const rowH = this.rowHeights[i];
      const isSelectedRow = this.selectedRow === i;
      const isInSelection = this.selectedCells && i >= this.selectedCells.startRow && i <= this.selectedCells.endRow;
      
      
    
      const colWidth = this.colWidths[0];
      this.ctx.fillStyle = (isSelectedRow || isInSelection) ? "#137e41" : "#f0f0f0";
      this.ctx.fillRect(0, rowY, colWidth, rowH);
      
      // Borders
      this.ctx.strokeStyle = "#e0e0e0";
      this.drawCrispLine(0, rowY, colWidth, rowY);
      this.drawCrispLine(0, rowY + rowH, colWidth, rowY + rowH);
      this.drawCrispLine(0, rowY, 0, rowY + rowH);
      this.drawCrispLine(colWidth, rowY, colWidth, rowY + rowH);
 
      this.ctx.fillStyle = (isSelectedRow || isInSelection) ? "white" : "black";
      
      this.ctx.textAlign = "right";
      this.ctx.fillText(i.toString(), colWidth-8, rowY + rowH / 2);
     
    }
   
    // ─── Step 3: Draw column headers (first row) ────────────────────────────────────
    const headerHeight = this.rowHeights[0];
    for (let j = startCol; j < endCol; j++) {
      const colX = this.getColumnX(j) - scrollLeft;
      const colW = this.colWidths[j];
      const isSelectedColumn = this.selectedColumn === j;
      const isInSelection = this.selectedCells && j >= this.selectedCells.startCol && j <= this.selectedCells.endCol;

      this.ctx.fillStyle = (isSelectedColumn || isInSelection) ? "#137e41" : "#f0f0f0";
      this.ctx.fillRect(colX, 0, colW, headerHeight);
     
      // Borders
      this.ctx.strokeStyle = "white";
      this.drawCrispLine(colX, 0, colX + colW, 0);
      this.drawCrispLine(colX, headerHeight, colX + colW, headerHeight);
      this.drawCrispLine(colX, 0, colX, headerHeight);
      this.drawCrispLine(colX + colW, 0, colX + colW, headerHeight);

      this.ctx.fillStyle = (isSelectedColumn || isInSelection) ? "white" : "black";

      if (j > 0) {
        const label = this.getColumnLabel(j - 1);
        this.ctx.fillText(label, colX + colW / 2, headerHeight / 2);
    
      }
    }

    //  Step 4: Draw selection border (for range) 
    if (this.selectedCells) {
      this.drawSelectionBorder(scrollTop, scrollLeft);
    }

    //  Step 5: Draw selection border for full column 
    if (this.selectedColumn !== null && this.selectedColumn > 0) {
      const colIndex = this.selectedColumn;
      const colX = this.getColumnX(colIndex) - scrollLeft;
      const colWidth = this.colWidths[colIndex];
      const topY = 0;
      const bottomY = this.canvas.height / this.dpr;

      this.ctx.strokeStyle = "#137e41";
      this.ctx.lineWidth = 2 / this.dpr;
      this.drawCrispRect(colX, topY, colWidth, bottomY);

      this.ctx.strokeStyle = "#0078d7";
      this.ctx.lineWidth = 1 / this.dpr;
      this.drawCrispRect(colX + 1, topY + 1, colWidth - 2, bottomY - 2);
    }

    //  Step 6: Draw selection border for full row 
    if (this.selectedRow !== null && this.selectedRow > 0) {
      const rowIndex = this.selectedRow;
      const rowY = this.getRowY(rowIndex) - scrollTop;
      const rowHeight = this.rowHeights[rowIndex];
      const leftX = 0;
      const rightX = this.canvas.width / this.dpr;

      this.ctx.strokeStyle = "#137e41";
      this.ctx.lineWidth = 2 / this.dpr;
      this.drawCrispRect(leftX, rowY, rightX, rowHeight);

      this.ctx.strokeStyle = "#0078d7";
      this.ctx.lineWidth = 1 / this.dpr;
      this.drawCrispRect(leftX + 1, rowY + 1, rightX - 2, rowHeight - 2);
    }

    // Step 7: Draw top-left corner cell (0,0)
    const cornerW = this.colWidths[0];
    const cornerH = this.rowHeights[0];
    this.ctx.fillStyle = "#f0f0f0";
    this.ctx.fillRect(0, 0, cornerW, cornerH);

    // Borders - mimic Excel selection style
    this.ctx.strokeStyle = "#b7b7b7";
    this.ctx.lineWidth = 2 / this.dpr;
    this.drawCrispLine(0, cornerH, cornerW, cornerH);  // bottom border
    this.drawCrispLine(cornerW, 0, cornerW, cornerH);  // right border

    // Optional: inner white border for highlight
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 100 / this.dpr;
    this.drawCrispLine(1, cornerH - 1, cornerW - 2, cornerH - 1); // inner bottom
    this.drawCrispLine(cornerW - 1, 1, cornerW - 1, cornerH - 2); // inner right

 
    // Draw bottom-right triangle in the (0,0) corner cell
    const triangleSize = Math.min(cornerW, cornerH) * 0.4; // Adjust triangle size

    this.ctx.fillStyle = "#a0a0a0"; // triangle color (light gray like Excel)
    this.ctx.beginPath();
    this.ctx.moveTo(cornerW, cornerH);                        // bottom-right corner
    this.ctx.lineTo(cornerW - triangleSize, cornerH);         // move left
    this.ctx.lineTo(cornerW, cornerH - triangleSize);         // move up
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawSelectionBorder(scrollTop: number, scrollLeft: number): void {
    if (!this.selectedCells) return;

    const { startRow, startCol, endRow, endCol } = this.selectedCells;
    

    //Actual Position
    const startX = this.getColumnX(startCol) - scrollLeft;
    const startY = this.getRowY(startRow) - scrollTop;
    const endX = this.getColumnX(endCol + 1) - scrollLeft;
    const endY = this.getRowY(endRow + 1) - scrollTop;
    

    // Height and width of selection rectangle
    const width = endX - startX;
    const height = endY - startY;

    // Draw thick dark border around selection
    this.ctx.strokeStyle = "#137e41";
    this.ctx.lineWidth = 2 / this.dpr;
    this.drawCrispRect(startX, startY, width, height);
    
    // Draw inner border for better definition
    this.ctx.strokeStyle = "#0078d7";
    this.ctx.lineWidth = 1 / this.dpr;
    this.drawCrispRect(startX + 1, startY + 1, width - 2, height - 2);
    
  }
  
  public loadJsonData(data: Array<Object>): void {
 
    this.totalRows = data.length + 1; // +1 for header
    
    // Header
    const headers = Object.keys(data[0]);
    for (let col = 0; col < headers.length; col++) {
      this.setCellData(1, col + 1, headers[col]); // header row at i = 0, skipping col=0
    }
    
  
    // Data rows
    data.forEach((item, rowIndex) => {
      const actualRow = rowIndex + 2;
      Object.keys(item).forEach((key, i) => {
        this.setCellData(actualRow, i + 1, item[key as keyof typeof item].toString());
      });
    });

    this.redraw();
  }

  public setColumnRangeSelection(startCol: number, endCol: number): void {
    this.selectedCells = {
      startRow: 1,
      endRow: this.totalRows - 1,
      startCol,
      endCol
    };
    this.selectedColumn = null; // clear single column selection
    this.selectedRow = null;
  }
  public setRowRangeSelection(startRow :number,endRow:number){
    this.selectedCells={
      startRow,
      endRow,
      startCol :0,
      endCol :this.totalCols - 1
    }
    this.selectedColumn = null;
    this.selectedRow = null;
  }
  
  public suppressNextHeaderClick(): void {
    this.suppressHeaderClick = true;
  }
  private calculateRowHeaderWidth(startRow: number, endRow: number): number {
    this.ctx.font = "12px Arial";
    let maxWidth = 0;
    
    for (let i = startRow; i < endRow; i++) {
      const rowNumText = i.toString();
      const textMetrics = this.ctx.measureText(rowNumText);
      maxWidth = Math.max(maxWidth, textMetrics.width + 16); // 16px padding
    }
    
    return Math.max(60, Math.ceil(maxWidth)); // minimum 60px
  }

 
}


