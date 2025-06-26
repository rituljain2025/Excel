//  export class Grid {
//   private ctx: CanvasRenderingContext2D;
//   private canvas: HTMLCanvasElement;

//   private rowHeight: number = 25;
//   private colWidth: number = 100;

//   private totalRows: number = 100000;
//   private totalCols: number = 500;

//   constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
//         this.ctx = ctx;
//         this.canvas = canvas;

//         // Set canvas virtual size
//         canvas.width = window.innerWidth;
//         canvas.height = window.innerHeight;


//         // Attach scroll handler
//         const container = document.getElementById("container")!;
//         container.addEventListener("scroll", () => {
//         this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
//         });
    
//         // Handle window resize
//         window.addEventListener("resize", () => {
//             canvas.width = window.innerWidth;
//             canvas.height = window.innerHeight;
//             this.drawVisibleGrid(
//                 container.scrollTop,
//                 container.scrollLeft,
//                 container.clientWidth,
//                 container.clientHeight
//             );
//         });
//         // Initial render
//         this.drawVisibleGrid(0, 0, window.innerWidth, window.innerHeight);
//   }

//   public getColWidth(): number {
//     return this.colWidth;
//   }

//   public setColWidth(width: number): void {
//     if (width >= 30 && width <= 500) {
//         this.colWidth = width;
//         const container = document.getElementById("container")!;
//         this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//         );
//     }
//   }
//   private  getColumnLabel(colIndex: number): string {
//         let label = '';
//         while (colIndex >= 0) {
//         label = String.fromCharCode((colIndex % 26) + 65) + label;
//         colIndex = Math.floor(colIndex / 26) - 1;
//         }
//         return label;
//   }

//   /**
//    * Draw only the visible portion of the grid
//    */
//  private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {
//   // Clear only visible canvas area
//   this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

//   const startRow = Math.floor(scrollTop / this.rowHeight);
//   const endRow = Math.min(this.totalRows, Math.ceil((scrollTop + viewHeight) / this.rowHeight));

//   const startCol = Math.floor(scrollLeft / this.colWidth);
//   const endCol = Math.min(this.totalCols, Math.ceil((scrollLeft + viewWidth) / this.colWidth));

//   this.ctx.font = "12px Arial";
//   this.ctx.textAlign = "center";
//   this.ctx.textBaseline = "middle";

//   for (let i = startRow; i < endRow; i++) {
//     for (let j = startCol; j < endCol; j++) {
//         const x = j * this.colWidth - scrollLeft;
//         const y = i * this.rowHeight - scrollTop;

//         this.ctx.strokeRect(x, y, this.colWidth, this.rowHeight);
        
//          // Optional: fill header background
//         if (i === 0 || j === 0) {
//             this.ctx.fillStyle = "#f0f0f0";
//             this.ctx.fillRect(x, y, this.colWidth, this.rowHeight);
//             this.ctx.fillStyle = "black";
//         }

//         // Top-left cell (empty)
//         if (i === 0 && j === 0) {
//             continue;
//         }

//         // Column headers (first row)
//         if (i === 0 && j > 0) {
//             const label = this.getColumnLabel(j - 1);
//             this.ctx.fillText(label, x + this.colWidth / 2, y + this.rowHeight / 2);
//         }

//          // Draw row header
//         if (j === 0 && i > 0) {
//             this.ctx.fillText(i.toString(), x + this.colWidth / 2, y + this.rowHeight / 2);
//         }
//     }
//   }
// }

// }


// window.addEventListener("DOMContentLoaded", () => {
//   const canvas = document.getElementById("excelCanvas") as HTMLCanvasElement;
//   const ctx = canvas.getContext("2d")!;
//   const grid = new Grid(ctx, canvas);
// });

//COLUMN RESIZING
// export class Grid {
//   private ctx: CanvasRenderingContext2D;
//   private canvas: HTMLCanvasElement;

//   private rowHeight: number = 25;
//   private colWidths: number[] = [];

//   private totalRows: number = 100000;
//   private totalCols: number = 500;
 
//   constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
//     this.ctx = ctx;
//     this.canvas = canvas;
    
//     // Initialize all column widths to 100
//     for (let i = 0; i < this.totalCols; i++) {
//       this.colWidths[i] = 100;
//     }

//     // Set canvas virtual size
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     // Attach scroll handler
//     const container = document.getElementById("container")!;
   
//     container.addEventListener("scroll", () => {
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     });

//     // Handle window resize
//     window.addEventListener("resize", () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
    
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     });

//     // Initial render
//     this.drawVisibleGrid(0, 0, window.innerWidth, window.innerHeight);
//   }

//   /**
//    * Get width of a specific column
//    */
//   public getColWidth(index: number): number {
//     return this.colWidths[index];
//   }

//   /**
//    * Set width of a specific column and re-render the grid
//    */
//   public setColWidth(index: number, width: number): void {
//     if (width >= 30 && width <= 500) {
//       this.colWidths[index] = width;
//       const container = document.getElementById("container")!;
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     }
//   }

//   /**
//    * Get cumulative X position for a column
//    */
//   public getColumnX(index: number): number {
//     let x = 0;
//     for (let i = 0; i < index; i++) {
//       x += this.colWidths[i];
//     }
//     return x;
//   }
  
//   /**
//    * Convert column index to label like A, B, ... Z, AA, AB
//    */
//   private getColumnLabel(colIndex: number): string {
//     let label = '';
//     while (colIndex >= 0) {
//       label = String.fromCharCode((colIndex % 26) + 65) + label;
//       colIndex = Math.floor(colIndex / 26) - 1;
//     }
//     return label;
//   }

//   /**
//    * Draw only the visible portion of the grid
//    */
//   private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {
//     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

//     const startRow = Math.floor(scrollTop / this.rowHeight);
//     const endRow = Math.min(this.totalRows, Math.ceil((scrollTop + viewHeight) / this.rowHeight));

//     // We need to find startCol and endCol manually due to variable widths
//     let startCol = 0, endCol = 0;
//     let x = 0;

//     for (let j = 0; j < this.totalCols; j++) {
//       const width = this.colWidths[j];
//       if (x + width >= scrollLeft && startCol === 0) {
//         startCol = j;
//       }
//       if (x >= scrollLeft + viewWidth) {
//         endCol = j;
//         break;
//       }
//       x += width;
//     }
//     if (endCol === 0) endCol = this.totalCols;

//     this.ctx.font = "12px Arial";
//     this.ctx.textAlign = "center";
//     this.ctx.textBaseline = "middle";

   
//     for (let i = startRow; i < endRow; i++) {
//         // Draw fixed row header (column 0)
//         const colWidth = this.colWidths[0];
//         const rowY = i * this.rowHeight - scrollTop;

//         this.ctx.fillStyle = "#f0f0f0";
//         this.ctx.fillRect(0, rowY, colWidth, this.rowHeight);
//         this.ctx.strokeRect(0, rowY, colWidth, this.rowHeight);
//         this.ctx.fillStyle = "black";
//         this.ctx.fillText(i.toString(), colWidth / 2, rowY + this.rowHeight / 2);

//         // Then draw rest of the visible columns
//         for (let j = startCol; j < endCol; j++) {
//             if (j === 0) continue; // Skip j = 0, already drawn above
      
//             const colX = this.getColumnX(j) - scrollLeft;
//             const colW = this.colWidths[j];

//             this.ctx.strokeRect(colX, rowY, colW, this.rowHeight);

//             // Header background
//             if (i === 0) {
//             this.ctx.fillStyle = "#f0f0f0";
//             this.ctx.fillRect(colX, rowY, colW, this.rowHeight);
//             this.ctx.fillStyle = "black";

//             const label = this.getColumnLabel(j - 1);
//             this.ctx.fillText(label, colX + colW / 2, rowY + this.rowHeight / 2);
//             }
//         }
//     }

//   }
// }


//row resizing

// export class Grid {
//   private ctx: CanvasRenderingContext2D;
//   private canvas: HTMLCanvasElement;

//   private colWidths: number[] = [];
//   private rowHeights: number[] = [];

//   public totalRows: number = 100000;
//   public totalCols: number = 500;
//   private cellData: Map<number, Map<number, string>> = new Map();

//   constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
//     this.ctx = ctx;
//     this.canvas = canvas;

//     for (let i = 0; i < this.totalCols; i++) {
//       this.colWidths[i] = 100;
//     }
//     for (let i = 0; i < this.totalRows; i++) {
//       this.rowHeights[i] = 25;
//     }

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const container = document.getElementById("container")!;

//     container.addEventListener("scroll", () => {
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     });

//     window.addEventListener("resize", () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     });

//     this.drawVisibleGrid(0, 0, window.innerWidth, window.innerHeight);
//   }

//   public getColWidth(index: number): number {
//     return this.colWidths[index];
//   }

//   public setColWidth(index: number, width: number): void {
//     if (width >= 30 && width <= 500) {
//       this.colWidths[index] = width;
//       const container = document.getElementById("container")!;
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     }
//   }

//   public getRowHeight(index: number): number {
//     return this.rowHeights[index];
//   }

//   public setRowHeight(index: number, height: number): void {
//     if (height >= 20 && height <= 200) {
//       this.rowHeights[index] = height;
//       const container = document.getElementById("container")!;
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     }
//   }

//   public getColumnX(index: number): number {
//     let x = 0;
//     for (let i = 0; i < index; i++) {
//       x += this.colWidths[i];
//     }
//     return x;
//   }

//   public getRowY(index: number): number {
//     let y = 0;
//     for (let i = 0; i < index; i++) {
//       y += this.rowHeights[i];
//     }
//     return y;
//   }
//   public setCellData(row: number, col: number, value: string): void {
//         if (!this.cellData.has(row)) {
//             this.cellData.set(row, new Map());
//         }
//         this.cellData.get(row)!.set(col, value);
//         const container = document.getElementById("container")!;
//         this.drawVisibleGrid(
//             container.scrollTop,
//             container.scrollLeft,
//             container.clientWidth,
//             container.clientHeight
//         );
//     }

//   public getCellData(row: number, col: number): string | undefined {
//     return this.cellData.get(row)?.get(col);
//   }

//   private getColumnLabel(colIndex: number): string {
//     let label = '';
//     while (colIndex >= 0) {
//       label = String.fromCharCode((colIndex % 26) + 65) + label;
//       colIndex = Math.floor(colIndex / 26) - 1;
//     }
//     return label;
//   }

//   private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {
//     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

//     let y = 0;
//     let startRow = 0, endRow = 0;
//     for (let i = 0; i < this.totalRows; i++) {
//       const h = this.rowHeights[i];
//       if (y + h >= scrollTop && startRow === 0) startRow = i;
//       if (y >= scrollTop + viewHeight) {
//         endRow = i;
//         break;
//       }
//       y += h;
//     }
//     if (endRow === 0) endRow = this.totalRows;

//     let x = 0;
//     let startCol = 0, endCol = 0;
//     for (let j = 0; j < this.totalCols; j++) {
//       const width = this.colWidths[j];
//       if (x + width >= scrollLeft && startCol === 0) startCol = j;
//       if (x >= scrollLeft + viewWidth) {
//         endCol = j;
//         break;
//       }
//       x += width;
//     }
//     if (endCol === 0) endCol = this.totalCols;

//     this.ctx.font = "12px Arial";
//     this.ctx.textAlign = "center";
//     this.ctx.textBaseline = "middle";

//     // Draw column headers
//     const headerHeight = this.rowHeights[0];
//     for (let j = startCol; j < endCol; j++) {
//       const colX = this.getColumnX(j) - scrollLeft;
//       const colW = this.colWidths[j];

//       this.ctx.fillStyle = "#f0f0f0";
//       this.ctx.fillRect(colX, 0, colW, headerHeight);
//       this.ctx.strokeRect(colX, 0, colW, headerHeight);
//       this.ctx.fillStyle = "black";

//       if (j > 0) {
//         const label = this.getColumnLabel(j - 1);
//         this.ctx.fillText(label, colX + colW / 2, headerHeight / 2);
//       }
//     }

//     for (let i = startRow; i < endRow; i++) {
//       const rowY = this.getRowY(i) - scrollTop;
//       const rowH = this.rowHeights[i];

//       // Draw row headers
//       const colWidth = this.colWidths[0];
//       this.ctx.fillStyle = "#f0f0f0";
//       this.ctx.fillRect(0, rowY, colWidth, rowH);
//       this.ctx.strokeRect(0, rowY, colWidth, rowH);
//       this.ctx.fillStyle = "black";
//       this.ctx.fillText(i.toString(), colWidth / 2, rowY + rowH / 2);

//       for (let j = startCol; j < endCol; j++) {
//         if (j === 0) continue;

//         const colX = this.getColumnX(j) - scrollLeft;
//         const colW = this.colWidths[j];

//         this.ctx.strokeRect(colX, rowY, colW, rowH);
//       }
    
//     }
  
//   }
// }

//JSON Data
export class Grid {

  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private colWidths: number[] = [];
  private rowHeights: number[] = [];

  public totalRows: number = 100000;
  public totalCols: number = 500;
  private cellData: Map<number, Map<number, string>> = new Map();

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.drawVisibleGrid(
        container.scrollTop,
        container.scrollLeft,
        container.clientWidth,
        container.clientHeight
      );
    });
 
    this.drawVisibleGrid(0, 0, window.innerWidth, window.innerHeight);
  }
  
  public getColWidth(index: number): number {
    return this.colWidths[index];
  }

  public setColWidth(index: number, width: number): void {
    if (width >= 30 && width <= 500) {
      this.colWidths[index] = width;
      const container = document.getElementById("container")!;
      this.drawVisibleGrid(
        container.scrollTop,
        container.scrollLeft,
        container.clientWidth,
        container.clientHeight
      );
    }
  }

  public getRowHeight(index: number): number {
    return this.rowHeights[index];
  }

  public setRowHeight(index: number, height: number): void {
    if (height >= 20 && height <= 200) {
      this.rowHeights[index] = height;
      const container = document.getElementById("container")!;
      this.drawVisibleGrid(
        container.scrollTop,
        container.scrollLeft,
        container.clientWidth,
        container.clientHeight
      );
    }
  }

  public getColumnX(index: number): number {
    let x = 0;
    for (let i = 0; i < index; i++) {
      x += this.colWidths[i];
    }
    return x;
  }

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
    const container = document.getElementById("container")!;
    this.drawVisibleGrid(
      container.scrollTop,
      container.scrollLeft,
      container.clientWidth,
      container.clientHeight
    );
  }

  public getCellData(row: number, col: number): string | undefined {
    return this.cellData.get(row)?.get(col);
  }

  private getColumnLabel(colIndex: number): string {
    let label = '';
    while (colIndex >= 0) {
      label = String.fromCharCode((colIndex % 26) + 65) + label;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return label;
  }
  
  public loadJsonData(data: { id: number; firstName: string; lastName: string; Age: number; Salary: number }[]): void {
    this.totalRows = data.length + 1; // +1 for header
    const container = document.getElementById("container")!;

    // Header
    const headers = ["ID", "First Name", "Last Name", "Age", "Salary"];
    for (let col = 0; col < headers.length; col++) {
      this.setCellData(0, col + 1, headers[col]); // header row at i = 0, skipping col=0
    }

    // Data rows
    data.forEach((item, rowIndex) => {
      const actualRow = rowIndex + 1;
      this.setCellData(actualRow, 0, item.id.toString()); // ID in column 0
      this.setCellData(actualRow, 1, item.firstName);
      this.setCellData(actualRow, 2, item.lastName);
      this.setCellData(actualRow, 3, item.Age.toString());
      this.setCellData(actualRow, 4, item.Salary.toString());
    });

    this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
}


  private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
    
    // Draw column headers
    const headerHeight = this.rowHeights[0];
    for (let j = startCol; j < endCol; j++) {
      const colX = this.getColumnX(j) - scrollLeft;
      const colW = this.colWidths[j];

      this.ctx.fillStyle = "#f0f0f0";
      this.ctx.fillRect(colX, 0, colW, headerHeight);
      this.ctx.strokeRect(colX, 0, colW, headerHeight);
      this.ctx.fillStyle = "black";

      if (j > 0) {
        const label = this.getColumnLabel(j - 1);
        this.ctx.fillText(label, colX + colW / 2, headerHeight / 2);
      }
    }

    for (let i = startRow; i < endRow; i++) {
      const rowY = this.getRowY(i) - scrollTop;
      const rowH = this.rowHeights[i];

      // Draw row headers
      const colWidth = this.colWidths[0];
      this.ctx.fillStyle = "#f0f0f0";
      this.ctx.fillRect(0, rowY, colWidth, rowH);
      this.ctx.strokeRect(0, rowY, colWidth, rowH);
      this.ctx.fillStyle = "black";
      this.ctx.fillText(i.toString(), colWidth / 2, rowY + rowH / 2);

      for (let j = startCol; j < endCol; j++) {
        if (j === 0) continue;

        const colX = this.getColumnX(j) - scrollLeft;
        const colW = this.colWidths[j];

        this.ctx.strokeRect(colX, rowY, colW, rowH);

        // Draw cell data if available
        const rowData = this.cellData.get(i);
        if (rowData) {
          const text = rowData.get(j);
          if (text) {
            this.ctx.fillStyle = "black";
            this.ctx.fillText(text, colX + colW / 2, rowY + rowH / 2);
          }
        }
      }
    }
  }
}
// Edit


/**
 * Grid class responsible for rendering the Excel-like grid on the canvas
 */


export class Grid {
  // private selectionManager!: SelectionManager;
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private colWidths: number[] = [];
  private rowHeights: number[] = [];

  public totalRows: number = 100000;
  public totalCols: number = 500;
  private cellData: Map<number, Map<number, string>> = new Map();

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
    // this.selectionManager = new SelectionManager();
    for (let i = 0; i < this.totalCols; i++) {
      this.colWidths[i] = 100;
    }
    for (let i = 0; i < this.totalRows; i++) {
      this.rowHeights[i] = 25;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.drawVisibleGrid(
        container.scrollTop,
        container.scrollLeft,
        container.clientWidth,
        container.clientHeight
      );
    });
  

 
    this.drawVisibleGrid(0, 0, window.innerWidth, window.innerHeight);
  }
  

  public getColWidth(index: number): number {
    return this.colWidths[index];
  }

  public setColWidth(index: number, width: number): void {
    if (width >= 30 && width <= 500) {
      this.colWidths[index] = width;
      const container = document.getElementById("container")!;
      this.drawVisibleGrid(
        container.scrollTop,
        container.scrollLeft,
        container.clientWidth,
        container.clientHeight
      );
    }
  }

  public getRowHeight(index: number): number {
    return this.rowHeights[index];
  }

  public setRowHeight(index: number, height: number): void {
    if (height >= 20 && height <= 200) {
      this.rowHeights[index] = height;
      const container = document.getElementById("container")!;
      this.drawVisibleGrid(
        container.scrollTop,
        container.scrollLeft,
        container.clientWidth,
        container.clientHeight
      );
    }
  }

  public getColumnX(index: number): number {
    let x = 0;
    for (let i = 0; i < index; i++) {
      x += this.colWidths[i];
    }
    return x;
  }

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
    const container = document.getElementById("container")!;
    this.drawVisibleGrid(
      container.scrollTop,
      container.scrollLeft,
      container.clientWidth,
      container.clientHeight
    );
  }

  public getCellData(row: number, col: number): string | undefined {
    return this.cellData.get(row)?.get(col);
  }

  private getColumnLabel(colIndex: number): string {
    let label = '';
    while (colIndex >= 0) {
      label = String.fromCharCode((colIndex % 26) + 65) + label;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return label;
  }
  
//   public loadJsonData(data: { id: number; firstName: string; lastName: string; Age: number; Salary: number }[]): void {
//     this.totalRows = data.length + 1; // +1 for header
//     const container = document.getElementById("container")!;

//     // Header
//     const headers = ["ID", "First Name", "Last Name", "Age", "Salary"];
//     for (let col = 0; col < headers.length; col++) {
//       this.setCellData(0, col + 1, headers[col]); // header row at i = 0, skipping col=0
//     }

//     // Data rows
//     data.forEach((item, rowIndex) => {
//       const actualRow = rowIndex + 1;
//       this.setCellData(actualRow, 0, item.id.toString()); // ID in column 0
//       this.setCellData(actualRow, 1, item.firstName);
//       this.setCellData(actualRow, 2, item.lastName);
//       this.setCellData(actualRow, 3, item.Age.toString());
//       this.setCellData(actualRow, 4, item.Salary.toString());
//     });

//     this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
// }


  private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
    
    // Draw column headers
    const headerHeight = this.rowHeights[0];
    for (let j = startCol; j < endCol; j++) {
      const colX = this.getColumnX(j) - scrollLeft;
      const colW = this.colWidths[j];

      this.ctx.fillStyle = "#f0f0f0";
      this.ctx.fillRect(colX, 0, colW, headerHeight);
      this.ctx.strokeRect(colX, 0, colW, headerHeight);
      this.ctx.fillStyle = "black";

      if (j > 0) {
        const label = this.getColumnLabel(j - 1);
        this.ctx.fillText(label, colX + colW / 2, headerHeight / 2);
      }
    }

    for (let i = startRow; i < endRow; i++) {
      const rowY = this.getRowY(i) - scrollTop;
      const rowH = this.rowHeights[i];

      // Draw row headers
      const colWidth = this.colWidths[0];
      this.ctx.fillStyle = "#f0f0f0";
      this.ctx.fillRect(0, rowY, colWidth, rowH);
      this.ctx.strokeRect(0, rowY, colWidth, rowH);
      this.ctx.fillStyle = "black";
      this.ctx.fillText(i.toString(), colWidth / 2, rowY + rowH / 2);

      for (let j = startCol; j < endCol; j++) {
        if (j === 0) continue;

        const colX = this.getColumnX(j) - scrollLeft;
        const colW = this.colWidths[j];

        this.ctx.strokeRect(colX, rowY, colW, rowH);

        // Draw cell data if available
        const rowData = this.cellData.get(i);
        if (rowData) {
          const text = rowData.get(j);
          if (text) {
            this.ctx.fillStyle = "black";
            this.ctx.fillText(text, colX + colW / 2, rowY + rowH / 2);
          }
        }
      }
    }
  }

 
}
//Column Selection

export class Grid {

  private selectedColumn: number | null = null;

  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private colWidths: number[] = [];
  private rowHeights: number[] = [];

  public totalRows: number = 100000;
  public totalCols: number = 500;
  private cellData: Map<number, Map<number, string>> = new Map();

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.drawVisibleGrid(
        container.scrollTop,
        container.scrollLeft,
        container.clientWidth,
        container.clientHeight
      );
    });
  
   this.canvas.addEventListener("click", this.handleDoubleClick.bind(this));

 
    this.drawVisibleGrid(0, 0, window.innerWidth, window.innerHeight);
  }
 

  private getColFromX(x: number): number {
    let currentX = 0;
    for (let col = 0; col < this.totalCols; col++) {
      currentX += this.colWidths[col];
      if (x < currentX) return col;
    }
    return -1; // not found
  }


  private redraw(): void {
    const container = document.getElementById("container")!;
    this.drawVisibleGrid(
      container.scrollTop,
      container.scrollLeft,
      container.clientWidth,
      container.clientHeight
    );
  }


  private handleDoubleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const container = document.getElementById("container")!;
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const adjustedX = x + scrollLeft;
    const adjustedY = y + scrollTop;

    const headerHeight = this.rowHeights[0];

    if (adjustedY < headerHeight) {
      const col = this.getColFromX(adjustedX);

      // ✅ Skip selecting col 0 (row header column)
      this.selectedColumn = (col > 0) ? col : null;
      this.redraw();
    } else {
      this.selectedColumn = null;
      this.redraw();
    }
  }




  public getColWidth(index: number): number {
    return this.colWidths[index];
  }

  public setColWidth(index: number, width: number): void {
    if (width >= 30 && width <= 500) {
      this.colWidths[index] = width;
      const container = document.getElementById("container")!;
      this.drawVisibleGrid(
        container.scrollTop,
        container.scrollLeft,
        container.clientWidth,
        container.clientHeight
      );
    }
  }

  public getRowHeight(index: number): number {
    return this.rowHeights[index];
  }

  public setRowHeight(index: number, height: number): void {
    if (height >= 20 && height <= 200) {
      this.rowHeights[index] = height;
      const container = document.getElementById("container")!;
      this.drawVisibleGrid(
        container.scrollTop,
        container.scrollLeft,
        container.clientWidth,
        container.clientHeight
      );
    }
  }

  public getColumnX(index: number): number {
    let x = 0;
    for (let i = 0; i < index; i++) {
      x += this.colWidths[i];
    }
    return x;
  }

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
    const container = document.getElementById("container")!;
    this.drawVisibleGrid(
      container.scrollTop,
      container.scrollLeft,
      container.clientWidth,
      container.clientHeight
    );
  }

  public getCellData(row: number, col: number): string | undefined {
    return this.cellData.get(row)?.get(col);
  }

  private getColumnLabel(colIndex: number): string {
    let label = '';
    while (colIndex >= 0) {
      label = String.fromCharCode((colIndex % 26) + 65) + label;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return label;
  }
  
//   public loadJsonData(data: { id: number; firstName: string; lastName: string; Age: number; Salary: number }[]): void {
//     this.totalRows = data.length + 1; // +1 for header
//     const container = document.getElementById("container")!;

//     // Header
//     const headers = ["ID", "First Name", "Last Name", "Age", "Salary"];
//     for (let col = 0; col < headers.length; col++) {
//       this.setCellData(0, col + 1, headers[col]); // header row at i = 0, skipping col=0
//     }

//     // Data rows
//     data.forEach((item, rowIndex) => {
//       const actualRow = rowIndex + 1;
//       this.setCellData(actualRow, 0, item.id.toString()); // ID in column 0
//       this.setCellData(actualRow, 1, item.firstName);
//       this.setCellData(actualRow, 2, item.lastName);
//       this.setCellData(actualRow, 3, item.Age.toString());
//       this.setCellData(actualRow, 4, item.Salary.toString());
//     });

//     this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
// }


//   private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {
//     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

//     let y = 0;
//     let startRow = 0, endRow = 0;
//     for (let i = 0; i < this.totalRows; i++) {
//       const h = this.rowHeights[i];
//       if (y + h >= scrollTop && startRow === 0) startRow = i;
//       if (y >= scrollTop + viewHeight) {
//         endRow = i;
//         break;
//       }
//       y += h;
//     }
//     if (endRow === 0) endRow = this.totalRows;

//     let x = 0;
//     let startCol = 0, endCol = 0;
//     for (let j = 0; j < this.totalCols; j++) {
//       const width = this.colWidths[j];
//       if (x + width >= scrollLeft && startCol === 0) startCol = j;
//       if (x >= scrollLeft + viewWidth) {
//         endCol = j;
//         break;
//       }
//       x += width;
//     }
//     if (endCol === 0) endCol = this.totalCols;

//     this.ctx.font = "12px Arial";
//     this.ctx.textAlign = "center";
//     this.ctx.textBaseline = "middle";
    
//     // Draw column headers
//     const headerHeight = this.rowHeights[0];
//     for (let j = startCol; j < endCol; j++) {
//       const colX = this.getColumnX(j) - scrollLeft;
//       const colW = this.colWidths[j];

//       this.ctx.fillStyle = "#f0f0f0";
//       this.ctx.fillRect(colX, 0, colW, headerHeight);
//       this.ctx.strokeRect(colX, 0, colW, headerHeight);
//       this.ctx.fillStyle = "black";

//       if (j > 0) {
//         const label = this.getColumnLabel(j - 1);
//         this.ctx.fillText(label, colX + colW / 2, headerHeight / 2);
//       }
//     }
//   if (
//   this.selectedColumn !== null &&
//   this.selectedColumn > 0 && 
//   this.selectedColumn >= startCol &&
//   this.selectedColumn <= endCol
// ) {
//   const colX = this.getColumnX(this.selectedColumn) - scrollLeft;
//   const colW = this.colWidths[this.selectedColumn];

//   // Highlight header
//   this.ctx.fillStyle = "#0078d7"; // dark blue
//   this.ctx.fillRect(colX, 0, colW, headerHeight);
//   this.ctx.fillStyle = "white";
//   const label = this.getColumnLabel(this.selectedColumn - 1);
//   this.ctx.fillText(label, colX + colW / 2, headerHeight / 2);

//   // Highlight entire column
//   for (let i = startRow; i < endRow; i++) {
//     const rowY = this.getRowY(i) - scrollTop;
//     const rowH = this.rowHeights[i];

//     this.ctx.fillStyle = "#e5f1fb"; // light blue
//     this.ctx.fillRect(colX, rowY, colW, rowH);
//     this.ctx.strokeStyle = "green";
//     this.ctx.strokeRect(colX, rowY, colW, rowH);

//     const rowData = this.cellData.get(i);
//     if (rowData) {
//       const text = rowData.get(this.selectedColumn);
//       if (text) {
//         this.ctx.fillStyle = "black";
//         this.ctx.fillText(text, colX + colW / 2, rowY + rowH / 2);
//       }
//     }
//   }
// }


//     for (let i = startRow; i < endRow; i++) {
//       const rowY = this.getRowY(i) - scrollTop;
//       const rowH = this.rowHeights[i];

//       // Draw row headers
//       const colWidth = this.colWidths[0];
//       this.ctx.fillStyle = "#f0f0f0";
//       this.ctx.fillRect(0, rowY, colWidth, rowH);
//       this.ctx.strokeRect(0, rowY, colWidth, rowH);
//       this.ctx.fillStyle = "black";
//       this.ctx.fillText(i.toString(), colWidth / 2, rowY + rowH / 2);

//       for (let j = startCol; j < endCol; j++) {
//         if (j === 0) continue;

//         const colX = this.getColumnX(j) - scrollLeft;
//         const colW = this.colWidths[j];

//         this.ctx.strokeRect(colX, rowY, colW, rowH);

//         // Draw cell data if available
//         const rowData = this.cellData.get(i);
//         if (rowData) {
//           const text = rowData.get(j);
//           if (text) {
//             this.ctx.fillStyle = "black";
//             this.ctx.fillText(text, colX + colW / 2, rowY + rowH / 2);
//           }
//         }
//       }
//     }
//   }


  private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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

      // Draw row headers
      const colWidth = this.colWidths[0];
      this.ctx.fillStyle = "#f0f0f0";
      this.ctx.fillRect(0, rowY, colWidth, rowH);
      this.ctx.strokeStyle = "black";
      this.ctx.strokeRect(0, rowY, colWidth, rowH);
      this.ctx.fillStyle = "black";
      this.ctx.fillText(i.toString(), colWidth / 2, rowY + rowH / 2);

      // Draw data cells
      for (let j = startCol; j < endCol; j++) {
        if (j === 0) continue;

        const colX = this.getColumnX(j) - scrollLeft;
        const colW = this.colWidths[j];

        // Check if this is the selected column
        const isSelectedColumn = this.selectedColumn === j && j > 0;
        
        // Fill background for selected column cells
        if (isSelectedColumn) {
          this.ctx.fillStyle = "#e5f1fb"; // Light blue background
          this.ctx.fillRect(colX, rowY, colW, rowH);
        }

        this.ctx.strokeStyle = "black";
        this.ctx.strokeRect(colX, rowY, colW, rowH);

        // Draw cell data if available
        const rowData = this.cellData.get(i);
        if (rowData) {
          const text = rowData.get(j);
          if (text) {
            this.ctx.fillStyle = "black";
            this.ctx.fillText(text, colX + colW / 2, rowY + rowH / 2);
          }
        }
      }
    }
  }
  
}

//Row Selection
// export class Grid {

//   private selectedColumn: number | null = null;
//   private selectedRow: number | null = null; // Add row selection

//   private ctx: CanvasRenderingContext2D;
//   private canvas: HTMLCanvasElement;

//   private colWidths: number[] = [];
//   private rowHeights: number[] = [];

//   public totalRows: number = 100000;
//   public totalCols: number = 500;
//   private cellData: Map<number, Map<number, string>> = new Map();

//   constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
//     this.ctx = ctx;
//     this.canvas = canvas;
  
//     for (let i = 0; i < this.totalCols; i++) {
//       this.colWidths[i] = 100;
//     }
//     for (let i = 0; i < this.totalRows; i++) {
//       this.rowHeights[i] = 25;
//     }

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const container = document.getElementById("container")!;

//     container.addEventListener("scroll", () => {
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     });

//     window.addEventListener("resize", () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     });
  
//     this.canvas.addEventListener("click", this.handleDoubleClick.bind(this));
//     this.drawVisibleGrid(0, 0, window.innerWidth, window.innerHeight);
//   }

//   private getColFromX(x: number): number {
//     let currentX = 0;
//     for (let col = 0; col < this.totalCols; col++) {
//       currentX += this.colWidths[col];
//       if (x < currentX) return col;
//     }
//     return -1; // not found
//   }

//   private getRowFromY(y: number): number {
//     let currentY = 0;
//     for (let row = 0; row < this.totalRows; row++) {
//       currentY += this.rowHeights[row];
//       if (y < currentY) return row;
//     }
//     return -1; // not found
//   }

//   private redraw(): void {
//     const container = document.getElementById("container")!;
//     this.drawVisibleGrid(
//       container.scrollTop,
//       container.scrollLeft,
//       container.clientWidth,
//       container.clientHeight
//     );
//   }

//   private handleDoubleClick(e: MouseEvent): void {
//     const rect = this.canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const container = document.getElementById("container")!;
//     const scrollLeft = container.scrollLeft;
//     const scrollTop = container.scrollTop;

//     const adjustedX = x + scrollLeft;
//     const adjustedY = y + scrollTop;

//     const headerHeight = this.rowHeights[0];
//     const rowHeaderWidth = this.colWidths[0];

//     // Clear previous selections
//     this.selectedColumn = null;
//     this.selectedRow = null;

//     if (adjustedY < headerHeight && adjustedX >= rowHeaderWidth) {
//       // Clicked in column header area (excluding row header)
//       const col = this.getColFromX(adjustedX);
//       this.selectedColumn = (col > 0) ? col : null;
//     } else if (adjustedX < rowHeaderWidth && adjustedY >= headerHeight) {
//       // Clicked in row header area (excluding column header)
//       const row = this.getRowFromY(adjustedY);
//       this.selectedRow = (row > 0) ? row : null;
//     }
//     // If clicked in data area or corner, no selection

//     this.redraw();
//   }

//   public getColWidth(index: number): number {
//     return this.colWidths[index];
//   }

//   public setColWidth(index: number, width: number): void {
//     if (width >= 30 && width <= 500) {
//       this.colWidths[index] = width;
//       const container = document.getElementById("container")!;
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     }
//   }

//   public getRowHeight(index: number): number {
//     return this.rowHeights[index];
//   }

//   public setRowHeight(index: number, height: number): void {
//     if (height >= 20 && height <= 200) {
//       this.rowHeights[index] = height;
//       const container = document.getElementById("container")!;
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     }
//   }

//   public getColumnX(index: number): number {
//     let x = 0;
//     for (let i = 0; i < index; i++) {
//       x += this.colWidths[i];
//     }
//     return x;
//   }

//   public getRowY(index: number): number {
//     let y = 0;
//     for (let i = 0; i < index; i++) {
//       y += this.rowHeights[i];
//     }
//     return y;
//   }

//   public setCellData(row: number, col: number, value: string): void {
//     if (!this.cellData.has(row)) {
//       this.cellData.set(row, new Map());
//     }
//     this.cellData.get(row)!.set(col, value);
//     const container = document.getElementById("container")!;
//     this.drawVisibleGrid(
//       container.scrollTop,
//       container.scrollLeft,
//       container.clientWidth,
//       container.clientHeight
//     );
//   }

//   public getCellData(row: number, col: number): string | undefined {
//     return this.cellData.get(row)?.get(col);
//   }

//   private getColumnLabel(colIndex: number): string {
//     let label = '';
//     while (colIndex >= 0) {
//       label = String.fromCharCode((colIndex % 26) + 65) + label;
//       colIndex = Math.floor(colIndex / 26) - 1;
//     }
//     return label;
//   }

//   private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {
//     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

//     let y = 0;
//     let startRow = 0, endRow = 0;
//     for (let i = 0; i < this.totalRows; i++) {
//       const h = this.rowHeights[i];
//       if (y + h >= scrollTop && startRow === 0) startRow = i;
//       if (y >= scrollTop + viewHeight) {
//         endRow = i;
//         break;
//       }
//       y += h;
//     }
//     if (endRow === 0) endRow = this.totalRows;

//     let x = 0;
//     let startCol = 0, endCol = 0;
//     for (let j = 0; j < this.totalCols; j++) {
//       const width = this.colWidths[j];
//       if (x + width >= scrollLeft && startCol === 0) startCol = j;
//       if (x >= scrollLeft + viewWidth) {
//         endCol = j;
//         break;
//       }
//       x += width;
//     }
//     if (endCol === 0) endCol = this.totalCols;

//     this.ctx.font = "12px Arial";
//     this.ctx.textAlign = "center";
//     this.ctx.textBaseline = "middle";
    
//     // Draw column headers
//     const headerHeight = this.rowHeights[0];
//     for (let j = startCol; j < endCol; j++) {
//       const colX = this.getColumnX(j) - scrollLeft;
//       const colW = this.colWidths[j];

//       // Check if this column is selected
//       const isSelectedColumn = this.selectedColumn === j && j > 0;
      
//       this.ctx.fillStyle = isSelectedColumn ? "#0078d7" : "#f0f0f0"; // Dark blue if selected, light gray otherwise
//       this.ctx.fillRect(colX, 0, colW, headerHeight);
//       this.ctx.strokeStyle = "black";
//       this.ctx.strokeRect(colX, 0, colW, headerHeight);
      
//       this.ctx.fillStyle = isSelectedColumn ? "white" : "black"; // White text if selected, black otherwise

//       if (j > 0) {
//         const label = this.getColumnLabel(j - 1);
//         this.ctx.fillText(label, colX + colW / 2, headerHeight / 2);
//       }
//     }

//     // Draw rows and cells
//     for (let i = startRow; i < endRow; i++) {
//       const rowY = this.getRowY(i) - scrollTop;
//       const rowH = this.rowHeights[i];

//       // Check if this row is selected
//       const isSelectedRow = this.selectedRow === i && i > 0;

//       // Draw row headers
//       const colWidth = this.colWidths[0];
//       this.ctx.fillStyle = isSelectedRow ? "#0078d7" : "#f0f0f0"; // Dark blue if selected
//       this.ctx.fillRect(0, rowY, colWidth, rowH);
//       this.ctx.strokeStyle = "black";
//       this.ctx.strokeRect(0, rowY, colWidth, rowH);
//       this.ctx.fillStyle = isSelectedRow ? "white" : "black"; // White text if selected
//       this.ctx.fillText(i.toString(), colWidth / 2, rowY + rowH / 2);

//       // Draw data cells
//       for (let j = startCol; j < endCol; j++) {
//         if (j === 0) continue;

//         const colX = this.getColumnX(j) - scrollLeft;
//         const colW = this.colWidths[j];

//         // Check if this is the selected column or row
//         const isSelectedColumn = this.selectedColumn === j && j > 0;
        
//         // Fill background for selected column or row cells
//         if (isSelectedColumn || isSelectedRow) {
//           this.ctx.fillStyle = "#e5f1fb"; // Light blue background
//           this.ctx.fillRect(colX, rowY, colW, rowH);
//         }

//         this.ctx.strokeStyle = "black";
//         this.ctx.strokeRect(colX, rowY, colW, rowH);

//         // Draw cell data if available
//         const rowData = this.cellData.get(i);
//         if (rowData) {
//           const text = rowData.get(j);
//           if (text) {
//             this.ctx.fillStyle = "black";
//             this.ctx.fillText(text, colX + colW / 2, rowY + rowH / 2);
//           }
//         }
//       }
//     }
//   }
// }


//full working file
// export class Grid {

//   private selectedColumn: number | null = null;
//   private selectedRow: number | null = null;
  
//   // Cell range selection properties
//   private selectedCells: {
//     startRow: number;
//     startCol: number;
//     endRow: number;
//     endCol: number;
//   } | null = null;
  
//   private isDragging: boolean = false;
//   private dragStartRow: number = -1;
//   private dragStartCol: number = -1;

//   private ctx: CanvasRenderingContext2D;
//   private canvas: HTMLCanvasElement;
 
//   private colWidths: number[] = [];
//   private rowHeights: number[] = [];

//   public totalRows: number = 100000;
//   public totalCols: number = 500;
//   private cellData: Map<number, Map<number, string>> = new Map();

//   constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
//     this.ctx = ctx;
//     this.canvas = canvas;
  
//     for (let i = 0; i < this.totalCols; i++) {
//       this.colWidths[i] = 80;
//     }
//     for (let i = 0; i < this.totalRows; i++) {
//       this.rowHeights[i] = 25;
//     }

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const container = document.getElementById("container")!;

//     container.addEventListener("scroll", () => {
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     });
  
    
//     window.addEventListener("resize", () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     });
  
//     // Add mouse event handlers for cell selection
//     this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
//     this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
//     this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
//     this.canvas.addEventListener("click", this.handleClick.bind(this));
    
//     this.drawVisibleGrid(0, 0, window.innerWidth, window.innerHeight);
//   }


//   public computeSelectedCellStats(): {
//     count: number;
//     min: number | null;
//     max: number | null;
//     sum: number;
//     avg: number | null;
//   } {
//     if (!this.selectedCells) return { count: 0, min: null, max: null, sum: 0, avg: null };

//     const { startRow, endRow, startCol, endCol } = this.selectedCells;

//     let numbers: number[] = [];

//     for (let row = startRow; row <= endRow; row++) {
//       for (let col = startCol; col <= endCol; col++) {
//         const val = this.getCellData(row, col);
//         if (val !== undefined && !isNaN(Number(val))) {
//           numbers.push(Number(val));
//         }
//       }
//     }

//     const count = numbers.length;
//     const sum = numbers.reduce((a, b) => a + b, 0);
//     const min = count > 0 ? Math.min(...numbers) : null;
//     const max = count > 0 ? Math.max(...numbers) : null;
//     const avg = count > 0 ? sum / count : null;

//     return { count, min, max, sum, avg };
//   }


//   private getColFromX(x: number): number {
//     let currentX = 0;
//     for (let col = 0; col < this.totalCols; col++) {
//       currentX += this.colWidths[col];
//       if (x < currentX) return col;
//     }
//     return -1; // not found
//   }

//   private getRowFromY(y: number): number {
//     let currentY = 0;
//     for (let row = 0; row < this.totalRows; row++) {
//       currentY += this.rowHeights[row];
//       if (y < currentY) return row;
//     }
//     return -1; // not found
//   }

//   private getCellFromCoordinates(x: number, y: number): { row: number, col: number } {
//     const container = document.getElementById("container")!;
//     const scrollLeft = container.scrollLeft;
//     const scrollTop = container.scrollTop;

//     const adjustedX = x + scrollLeft;
//     const adjustedY = y + scrollTop;

//     const col = this.getColFromX(adjustedX);
//     const row = this.getRowFromY(adjustedY);

//     return { row, col };
//   }

//   private redraw(): void {
//     const container = document.getElementById("container")!;
//     this.drawVisibleGrid(
//       container.scrollTop,
//       container.scrollLeft,
//       container.clientWidth,
//       container.clientHeight
//     );
//   }

//   private handleMouseDown(e: MouseEvent): void {
//     const rect = this.canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const headerHeight = this.rowHeights[0];
//     const rowHeaderWidth = this.colWidths[0];

//     // Only handle cell selection in data area
//     if (x >= rowHeaderWidth && y >= headerHeight) {
//       const { row, col } = this.getCellFromCoordinates(x, y);
      
//       if (row > 0 && col > 0 && row < this.totalRows && col < this.totalCols) {
//         this.isDragging = true;
//         this.dragStartRow = row;
//         this.dragStartCol = col;
        
//         // Clear previous selections when starting cell selection
//         this.selectedColumn = null;
//         this.selectedRow = null;
//         this.selectedCells = {
//           startRow: row,
//           startCol: col,
//           endRow: row,
//           endCol: col
//         };
        
//         this.redraw();
//       }
//     }
//     // Don't handle header clicks here - let the click event handle them
//   }

//   private handleMouseMove(e: MouseEvent): void {
//     if (!this.isDragging) return;

//     const rect = this.canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const headerHeight = this.rowHeights[0];
//     const rowHeaderWidth = this.colWidths[0];

//     if (x >= rowHeaderWidth && y >= headerHeight) {
//       const { row, col } = this.getCellFromCoordinates(x, y);
      
//       if (row > 0 && col > 0 && row < this.totalRows && col < this.totalCols) {
//         if (this.selectedCells) {
//           // Update the selection range
//           this.selectedCells.startRow = Math.min(this.dragStartRow, row);
//           this.selectedCells.endRow = Math.max(this.dragStartRow, row);
//           this.selectedCells.startCol = Math.min(this.dragStartCol, col);
//           this.selectedCells.endCol = Math.max(this.dragStartCol, col);
          
//           this.redraw();
//         }
//       }
//     }
//   }

//   private handleMouseUp(e: MouseEvent): void {
//     if (this.isDragging) {
//       this.isDragging = false;
//       // Selection should persist after drag ends
//       console.log("Selection completed:", this.selectedCells);
//     }
//   }

//   private handleClick(e: MouseEvent): void {
//     // Only handle clicks if we're not dragging (to avoid interfering with drag selection)
//     if (this.isDragging) return;

//     const rect = this.canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const container = document.getElementById("container")!;
//     const scrollLeft = container.scrollLeft;
//     const scrollTop = container.scrollTop;

//     const headerHeight = this.rowHeights[0];
//     const rowHeaderWidth = this.colWidths[0];

//     // Check if clicked in the visible column header area
//     if (y < headerHeight && x >= rowHeaderWidth) {
//       // Clicked in column header area (excluding row header)
//       // Clear cell selection when selecting column
//       this.selectedCells = null;
//       this.selectedRow = null;
      
//       // Adjust x coordinate for scroll position to get the actual column
//       const adjustedX = x + scrollLeft;
//       const col = this.getColFromX(adjustedX);
//       this.selectedColumn = (col > 0) ? col : null;
//       this.redraw();
//     } else if (x < rowHeaderWidth && y >= headerHeight) {
//       // Clicked in row header area (excluding column header)
//       // Clear cell selection when selecting row
//       this.selectedCells = null;
//       this.selectedColumn = null;
      
//       // Adjust y coordinate for scroll position to get the actual row
//       const adjustedY = y + scrollTop;
//       const row = this.getRowFromY(adjustedY);
//       this.selectedRow = (row > 0) ? row : null;
//       this.redraw();
//     } else if (x < rowHeaderWidth && y < headerHeight) {
//       // Clicked in corner - clear all selections
//       this.selectedCells = null;
//       this.selectedColumn = null;
//       this.selectedRow = null;
//       this.redraw();
//     }
//     // If clicked in data area, cell selection is already handled by mousedown/drag
//   }

//   public getColWidth(index: number): number {
//     return this.colWidths[index];
//   }

//   public setColWidth(index: number, width: number): void {
//     if (width >= 30 && width <= 500) {
//       this.colWidths[index] = width;
//       const container = document.getElementById("container")!;
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     }
//   }

//   public getRowHeight(index: number): number {
//     return this.rowHeights[index];
//   }

//   public setRowHeight(index: number, height: number): void {
//     if (height >= 20 && height <= 200) {
//       this.rowHeights[index] = height;
//       const container = document.getElementById("container")!;
//       this.drawVisibleGrid(
//         container.scrollTop,
//         container.scrollLeft,
//         container.clientWidth,
//         container.clientHeight
//       );
//     }
//   }

//   public getColumnX(index: number): number {
//     let x = 0;
//     for (let i = 0; i < index; i++) {
//       x += this.colWidths[i];
//     }
//     return x;
//   }

//   public getRowY(index: number): number {
//     let y = 0;
//     for (let i = 0; i < index; i++) {
//       y += this.rowHeights[i];
//     }
//     return y;
//   }

//   public setCellData(row: number, col: number, value: string): void {
//     if (!this.cellData.has(row)) {
//       this.cellData.set(row, new Map());
//     }
//     this.cellData.get(row)!.set(col, value);
//     const container = document.getElementById("container")!;
//     this.drawVisibleGrid(
//       container.scrollTop,
//       container.scrollLeft,
//       container.clientWidth,
//       container.clientHeight
//     );
//   }

//   public getCellData(row: number, col: number): string | undefined {
//     return this.cellData.get(row)?.get(col);
//   }

//   // Get the currently selected cell range
//   public getSelectedRange(): { startRow: number; startCol: number; endRow: number; endCol: number } | null {
//     return this.selectedCells;
//   }

//   // Clear all selections
//   public clearSelection(): void {
//     this.selectedCells = null;
//     this.selectedColumn = null;
//     this.selectedRow = null;
//     this.redraw();
//   }

//   private getColumnLabel(colIndex: number): string {
//     let label = '';
//     while (colIndex >= 0) {
//       label = String.fromCharCode((colIndex % 26) + 65) + label;
//       colIndex = Math.floor(colIndex / 26) - 1;
//     }
//     return label;
//   }

//   private isCellInSelection(row: number, col: number): boolean {
//     if (!this.selectedCells) return false;
    
//     return row >= this.selectedCells.startRow && 
//            row <= this.selectedCells.endRow && 
//            col >= this.selectedCells.startCol && 
//            col <= this.selectedCells.endCol;
//   }

//   private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {
//     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

//     let y = 0;
//     let startRow = 0, endRow = 0;
//     for (let i = 0; i < this.totalRows; i++) {
//       const h = this.rowHeights[i];
//       if (y + h >= scrollTop && startRow === 0) startRow = i;
//       if (y >= scrollTop + viewHeight) {
//         endRow = i;
//         break;
//       }
//       y += h;
//     }
//     if (endRow === 0) endRow = this.totalRows;

//     let x = 0;
//     let startCol = 0, endCol = 0;
//     for (let j = 0; j < this.totalCols; j++) {
//       const width = this.colWidths[j];
//       if (x + width >= scrollLeft && startCol === 0) startCol = j;
//       if (x >= scrollLeft + viewWidth) {
//         endCol = j;
//         break;
//       }
//       x += width;
//     }
//     if (endCol === 0) endCol = this.totalCols;

//     this.ctx.font = "12px Arial";
//     this.ctx.textAlign = "center";
//     this.ctx.textBaseline = "middle";
    
//     // Draw column headers
//     const headerHeight = this.rowHeights[0];
//     for (let j = startCol; j < endCol; j++) {
//       const colX = this.getColumnX(j) - scrollLeft;
//       const colW = this.colWidths[j];

//       // Check if this column is selected
//       const isSelectedColumn = this.selectedColumn === j && j > 0;
      
//       this.ctx.fillStyle = isSelectedColumn ? "#137e41" : "#f0f0f0"; // Dark blue if selected, light gray otherwise
//       this.ctx.fillRect(colX, 0, colW, headerHeight);
//       this.ctx.strokeStyle = "white";
//       this.ctx.strokeRect(colX, 0, colW, headerHeight);
      
//       this.ctx.fillStyle = isSelectedColumn ? "white" : "black"; // White text if selected, black otherwise

//       if (j > 0) {
//         const label = this.getColumnLabel(j - 1);
//         this.ctx.fillText(label, colX + colW / 2, headerHeight / 2);
//       }
//     }

//     // Draw rows and cells
//     for (let i = startRow; i < endRow; i++) {
//       const rowY = this.getRowY(i) - scrollTop;
//       const rowH = this.rowHeights[i];

//       // Check if this row is selected
//       const isSelectedRow = this.selectedRow === i && i > 0;

//       // Draw row headers
//       const colWidth = this.colWidths[0];
//       this.ctx.fillStyle = isSelectedRow ? "#137e41" : "#f0f0f0"; // Dark blue if selected
//       this.ctx.fillRect(0, rowY, colWidth, rowH);
//       this.ctx.strokeStyle = "#e0e0e0";
//       this.ctx.strokeRect(0, rowY, colWidth, rowH);
//       this.ctx.fillStyle = isSelectedRow ? "white" : "black"; // White text if selected
//       this.ctx.fillText(i.toString(), colWidth / 2, rowY + rowH / 2);
      
//       // Draw data cells
//       for (let j = startCol; j < endCol; j++) {
//         if (j === 0) continue;

//         const colX = this.getColumnX(j) - scrollLeft;
//         const colW = this.colWidths[j];

//         // Check if this is the selected column or row
//         const isSelectedColumn = this.selectedColumn === j && j > 0;
//         const isCellSelected = this.isCellInSelection(i, j);
        
//         // Fill background for selected cells, column or row cells
//         if (isCellSelected) {
//           // Selected cell range - light blue background for inner area
//           this.ctx.fillStyle = "white"; // Lighter blue for inner area
//           this.ctx.fillRect(colX, rowY, colW, rowH);
//         } else if (isSelectedColumn || isSelectedRow) {
//           // Selected column or row - light blue background
//           this.ctx.fillStyle = "#e7f2eb";
//           this.ctx.fillRect(colX, rowY, colW, rowH);
//         }

//         this.ctx.strokeStyle = "e0e0e0";
//         this.ctx.strokeRect(colX, rowY, colW, rowH);

//         // Draw cell data if available
//         const rowData = this.cellData.get(i);
//         if (rowData) {
//           const text = rowData.get(j);
//           if (text) {
//             this.ctx.fillStyle = "black"; // Always black text for better readability
//             this.ctx.fillText(text, colX + colW / 2, rowY + rowH / 2);
//           }
//         }
//       }
//     }
    
//     // Draw selection border for cell range
//     if (this.selectedCells) {
//       this.drawSelectionBorder(scrollTop, scrollLeft);
//     }

//     // Draw selection border for entire selected column
//     if (this.selectedColumn !== null && this.selectedColumn > 0) {
//       const colIndex = this.selectedColumn;
//       const colX = this.getColumnX(colIndex) - scrollLeft;
//       const colWidth = this.colWidths[colIndex];

//       // Full height = header + all visible rows
//       const topY = 0;
//       const bottomY = this.canvas.height;

//       this.ctx.strokeStyle = "#137e41"; // Dark green border
//       this.ctx.lineWidth = 2;
//       this.ctx.strokeRect(colX, topY, colWidth, bottomY);

//       this.ctx.strokeStyle = "#0078d7"; // Inner blue
//       this.ctx.lineWidth = 1;
//       this.ctx.strokeRect(colX + 1, topY + 1, colWidth - 2, bottomY - 2);

//       this.ctx.lineWidth = 1; // Reset line width
//     }
//     // Draw selection border for entire selected row
//     if (this.selectedRow !== null && this.selectedRow > 0) {
//       const rowIndex = this.selectedRow;
//       const rowY = this.getRowY(rowIndex) - scrollTop;
//       const rowHeight = this.rowHeights[rowIndex];

//       // Full width = row header + all visible columns
//       const leftX = 0;
//       const rightX = this.canvas.width;

//       this.ctx.strokeStyle = "#137e41"; // Dark green border
//       this.ctx.lineWidth = 2;
//       this.ctx.strokeRect(leftX, rowY, rightX, rowHeight);

//       this.ctx.strokeStyle = "#0078d7"; // Inner blue
//       this.ctx.lineWidth = 1;
//       this.ctx.strokeRect(leftX + 1, rowY + 1, rightX - 2, rowHeight - 2);

//       this.ctx.lineWidth = 1; // Reset line width
//     }

//   }
  



//   private drawSelectionBorder(scrollTop: number, scrollLeft: number): void {
//     if (!this.selectedCells) return;

//     const { startRow, startCol, endRow, endCol } = this.selectedCells;
    
//     const startX = this.getColumnX(startCol) - scrollLeft;
//     const startY = this.getRowY(startRow) - scrollTop;
//     const endX = this.getColumnX(endCol + 1) - scrollLeft;
//     const endY = this.getRowY(endRow + 1) - scrollTop;
    
//     const width = endX - startX;
//     const height = endY - startY;

//     // Draw thick dark border around selection
//     this.ctx.strokeStyle = "#137e41"; // Dark blue border
//     this.ctx.lineWidth = 2;
//     this.ctx.strokeRect(startX, startY, width, height);
    
//     // Draw inner border for better definition
//     this.ctx.strokeStyle = "#0078d7"; // Medium blue inner border
//     this.ctx.lineWidth = 1;
//     this.ctx.strokeRect(startX + 1, startY + 1, width - 2, height - 2);
    
//     this.ctx.lineWidth = 1; // Reset line width
//   }
  
  
    
//   public loadJsonData(data: Array<Object>): void {
//     this.totalRows = data.length + 1; // +1 for header
//     const container = document.getElementById("container")!;

//     // Header
//     const headers = Object.keys(data[0]);
//     for (let col = 0; col < headers.length; col++) {
//       this.setCellData(0, col + 1, headers[col]); // header row at i = 0, skipping col=0
//     }

//     // Data rows
//     data.forEach((item, rowIndex) => {

//       const actualRow = rowIndex + 1;
//       Object.keys(item).forEach((key,i)=>{
          
//       this.setCellData(actualRow, i, item[key as keyof typeof item].toString()); // ID in column 0
//       })
//       // this.setCellData(actualRow, 1, item.firstName);
//       // this.setCellData(actualRow, 2, item.lastName);
//       // this.setCellData(actualRow, 3, item.Age.toString());
//       // this.setCellData(actualRow, 4, item.Salary.toString());
      
//     });

//     // this.drawVisibleGrid(container.scrollTop, container.scrollLeft, container.clientWidth, container.clientHeight);
//   }
  
// }


//drawVisibleGrid
// private drawVisibleGrid(scrollTop: number, scrollLeft: number, viewWidth: number, viewHeight: number): void {
  //   this.ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);

  //   let y = 0;
  //   let startRow = 0, endRow = 0;
  //   for (let i = 0; i < this.totalRows; i++) {
  //     const h = this.rowHeights[i];
  //     if (y + h >= scrollTop && startRow === 0) startRow = i;
  //     if (y >= scrollTop + viewHeight) {
  //       endRow = i;
  //       break;
  //     }
  //     y += h;
  //   }
  //   if (endRow === 0) endRow = this.totalRows;

  //   let x = 0;
  //   let startCol = 0, endCol = 0;
  //   for (let j = 0; j < this.totalCols; j++) {
  //     const width = this.colWidths[j];
  //     if (x + width >= scrollLeft && startCol === 0) startCol = j;
  //     if (x >= scrollLeft + viewWidth) {
  //       endCol = j;
  //       break;
  //     }
  //     x += width;
  //   }
  //   if (endCol === 0) endCol = this.totalCols;

  //   this.ctx.font = "12px Arial";
  //   this.ctx.textAlign = "center";
  //   this.ctx.textBaseline = "middle";
  //   this.ctx.lineWidth = 1 / this.dpr; // Set line width for crisp 1px lines
    
  //   // Draw column headers
  //   const headerHeight = this.rowHeights[0];
  //   for (let j = startCol; j < endCol; j++) {
  //     const colX = this.getColumnX(j) - scrollLeft;
  //     const colW = this.colWidths[j];

  //     // Check if this column is selected
  //     const isSelectedColumn = this.selectedColumn === j && j > 0;
      
  //     this.ctx.fillStyle = isSelectedColumn ? "#137e41" : "#f0f0f0";
  //     this.ctx.fillRect(colX, 0, colW, headerHeight);
      
  //     // Draw crisp border lines for header
  //     this.ctx.strokeStyle = "white";
  //     this.drawCrispLine(colX, 0, colX + colW, 0); // Top
  //     this.drawCrispLine(colX, headerHeight, colX + colW, headerHeight); // Bottom
  //     this.drawCrispLine(colX, 0, colX, headerHeight); // Left
  //     this.drawCrispLine(colX + colW, 0, colX + colW, headerHeight); // Right
      
  //     this.ctx.fillStyle = isSelectedColumn ? "white" : "black";

  //     if (j > 0) {
  //       const label = this.getColumnLabel(j - 1);
  //       this.ctx.fillText(label, colX + colW / 2, headerHeight / 2);
  //     }
  //   }

  //   // Draw rows and cells
  //   for (let i = startRow; i < endRow; i++) {
  //     const rowY = this.getRowY(i) - scrollTop;
  //     const rowH = this.rowHeights[i];

  //     // Check if this row is selected
  //     const isSelectedRow = this.selectedRow === i && i > 0;

  //     // Draw row headers
  //     const colWidth = this.colWidths[0];
  //     this.ctx.fillStyle = isSelectedRow ? "#137e41" : "#f0f0f0";
  //     this.ctx.fillRect(0, rowY, colWidth, rowH);
      
  //     // Draw crisp border lines for row header
  //     this.ctx.strokeStyle = "#e0e0e0";
  //     this.drawCrispLine(0, rowY, colWidth, rowY); // Top
  //     this.drawCrispLine(0, rowY + rowH, colWidth, rowY + rowH); // Bottom
  //     this.drawCrispLine(0, rowY, 0, rowY + rowH); // Left
  //     this.drawCrispLine(colWidth, rowY, colWidth, rowY + rowH); // Right
      
  //     this.ctx.fillStyle = isSelectedRow ? "white" : "black";
  //     this.ctx.fillText(i.toString(), colWidth / 2, rowY + rowH / 2);
      
  //     // Draw data cells
  //     for (let j = startCol; j < endCol; j++) {
  //       if (j === 0) continue;

  //       const colX = this.getColumnX(j) - scrollLeft;
  //       const colW = this.colWidths[j];

  //       // Check if this is the selected column or row
  //       const isSelectedColumn = this.selectedColumn === j && j > 0;
  //       const isCellSelected = this.isCellInSelection(i, j);
        
  //       // Fill background for selected cells, column or row cells
  //       if (isCellSelected) {
  //         // Selected cell range - white background for inner area
  //         this.ctx.fillStyle = "white";
  //         this.ctx.fillRect(colX, rowY, colW, rowH);
  //       } else if (isSelectedColumn || isSelectedRow) {
  //         // Selected column or row - light green background
  //         this.ctx.fillStyle = "#e7f2eb";
  //         this.ctx.fillRect(colX, rowY, colW, rowH);
  //       }

  //       // Draw crisp grid lines for data cells
  //       this.ctx.strokeStyle = "#e0e0e0";
  //       this.drawCrispLine(colX, rowY, colX + colW, rowY); // Top
  //       this.drawCrispLine(colX, rowY + rowH, colX + colW, rowY + rowH); // Bottom
  //       this.drawCrispLine(colX, rowY, colX, rowY + rowH); // Left
  //       this.drawCrispLine(colX + colW, rowY, colX + colW, rowY + rowH); // Right

  //       // Draw cell data if available
  //       const rowData = this.cellData.get(i);
  //       if (rowData) {
  //         const text = rowData.get(j);
  //         if (text) {
  //           this.ctx.fillStyle = "black";
  //           this.ctx.fillText(text, colX + colW / 2, rowY + rowH / 2);
  //         }
  //       }
  //     }
  //   }
    
  //   // Draw selection border for cell range
  //   if (this.selectedCells) {
  //     this.drawSelectionBorder(scrollTop, scrollLeft);
  //   }

  //   // Draw selection border for entire selected column
  //   if (this.selectedColumn !== null && this.selectedColumn > 0) {
  //     const colIndex = this.selectedColumn;
  //     const colX = this.getColumnX(colIndex) - scrollLeft;
  //     const colWidth = this.colWidths[colIndex];

  //     // Full height = header + all visible rows
  //     const topY = 0;
  //     const bottomY = this.canvas.height / this.dpr;

  //     this.ctx.strokeStyle = "#137e41";
  //     this.ctx.lineWidth = 2 / this.dpr;
  //     this.drawCrispRect(colX, topY, colWidth, bottomY);

  //     this.ctx.strokeStyle = "#0078d7";
  //     this.ctx.lineWidth = 1 / this.dpr;
  //     this.drawCrispRect(colX + 1, topY + 1, colWidth - 2, bottomY - 2);
  //   }
    
  //   // Draw selection border for entire selected row
  //   if (this.selectedRow !== null && this.selectedRow > 0) {
  //     const rowIndex = this.selectedRow;
  //     const rowY = this.getRowY(rowIndex) - scrollTop;
  //     const rowHeight = this.rowHeights[rowIndex];

  //     // Full width = row header + all visible columns
  //     const leftX = 0;
  //     const rightX = this.canvas.width / this.dpr;

  //     this.ctx.strokeStyle = "#137e41";
  //     this.ctx.lineWidth = 2 / this.dpr;
  //     this.drawCrispRect(leftX, rowY, rightX, rowHeight);

  //     this.ctx.strokeStyle = "#0078d7";
  //     this.ctx.lineWidth = 1 / this.dpr;
  //     this.drawCrispRect(leftX + 1, rowY + 1, rightX - 2, rowHeight - 2);
  //   }
  // }
  