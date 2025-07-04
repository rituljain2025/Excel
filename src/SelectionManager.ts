// SelectionManager.ts
import { Grid } from './grid.js';

export class SelectionManager {
  private isDragging = false;
  private dragStartRow = -1;
  private dragStartCol = -1;
  private suppressHeaderClick = 0;
  private autoScrollInterval: number | null = null;
  private lastMouseEvent: MouseEvent | null = null;
  private anchorRow : number|null =null;
  private anchorCol : number | null = null;
  private startRowDown : number | null = null;
  private startColDown : number | null = null;

  constructor(private canvas: HTMLCanvasElement, private grid: Grid) {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("click", this.handleClick);
    document.addEventListener("keydown",this.handleKeyDown);

  }

  public suppressNextHeaderClick(): void {
    this.suppressHeaderClick = Date.now() + 60;
  }

  private handleMouseDown = (e: MouseEvent): void => {
    if ((this.canvas as any)._isResizing) return;
    console.log((this.canvas as any)._isResizing);
    if((this.canvas as any)._isRowResizing) return; // Prevent conflict with row resizing
    console.log("SelectionManager onMouseDown");
    if (Date.now() < this.suppressHeaderClick) return;
     
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const headerHeight = this.grid.rowHeights[0];
    const rowHeaderWidth = this.grid.colWidths[0];

    if (x >= rowHeaderWidth && y >= headerHeight) {
      const { row, col } = this.grid.getCellFromCoordinates(x, y);

      if (row > 0 && col > 0 && row < this.grid.totalRows && col < this.grid.totalCols) {
        this.isDragging = true;
        this.dragStartRow = row;
        this.dragStartCol = col;
      
        this.grid.selectedColumn = null;
        this.grid.selectedRow = null;
        this.grid.selectedCells = {
          startRow: row,
          startCol: col,
          endRow: row,
          endCol: col
        };
         this.anchorRow = this.grid.selectedCells.startRow;
         this.anchorCol = this.grid.selectedCells.startCol;
         console.log(this.anchorCol + "anchor col" );
         console.log(this.anchorRow + "anchor row" );
         this.startColDown = this.anchorCol;
         this.startRowDown = this.anchorRow;
         
        this.startAutoScroll();

        if (this.grid.onStatsUpdateCallback) {
          const stats = this.grid.computeSelectedCellStats();
          this.grid.onStatsUpdateCallback(stats);
        }
        this.grid.redraw();
      }
    }
  };
  private updateSelectionFromMouse(x: number, y: number): void {
    const rect = this.canvas.getBoundingClientRect();
   
    const localX = x - rect.left ;
    const localY = y - rect.top ;  

    const headerHeight = this.grid.rowHeights[0];
    const rowHeaderWidth = this.grid.colWidths[0];

    if (localX >= rowHeaderWidth && localY >= headerHeight) {
      const { row, col } = this.grid.getCellFromCoordinates(localX, localY);

      if (
        row > 0 &&
        col > 0 &&
        row < this.grid.totalRows &&
        col < this.grid.totalCols &&
        this.grid.selectedCells
      ) {
        this.grid.selectedCells.startRow = Math.min(this.dragStartRow, row);
        this.grid.selectedCells.endRow = Math.max(this.dragStartRow, row);
        this.grid.selectedCells.startCol = Math.min(this.dragStartCol, col);
        this.grid.selectedCells.endCol = Math.max(this.dragStartCol, col);

        if (this.grid.onStatsUpdateCallback) {
          const stats = this.grid.computeSelectedCellStats();
          this.grid.onStatsUpdateCallback(stats);
        }

        this.grid.redraw();
      }
    }
  }

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;
    this.lastMouseEvent = e;
    this.updateSelectionFromMouse(e.clientX,e.clientY);
  };

  private handleMouseUp = (e: MouseEvent): void => {
    this.stopAutoScroll();
    if (this.isDragging) {
      this.stopAutoScroll();
      this.isDragging = false;
    }
  };
  private startAutoScroll(): void {
    if (this.autoScrollInterval !== null) return; // Already running

    // container: The scrollable container holding the canvas.
    // scrollSpeed: How fast to scroll each tick (every 30ms).
    // buffer: How close to the edge the mouse needs to be before scrolling starts.
    // intervalTime: The speed of polling (smoothness of scrolling).
    const container = document.getElementById("container")!;
    const scrollSpeed = 30; // pixels per interval
    const buffer = 50; // px from edge before it starts scrolling
    const intervalTime = 20; // ms

    this.autoScrollInterval = window.setInterval(() => {
      if (!this.isDragging ) return;
      if(!this.lastMouseEvent) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = this.lastMouseEvent.clientX;
      const mouseY = this.lastMouseEvent.clientY;

      const dx = mouseX - rect.left;
      const dy = mouseY - rect.top;

      let scrolled = false;

      // Scroll down
      if (dy > container.clientHeight - buffer) {
        container.scrollTop += scrollSpeed;
        scrolled = true;
      }

      // Scroll up
      if (dy < buffer) {
        container.scrollTop -= scrollSpeed;
        scrolled = true;
      }

      // Scroll right
      if (dx > container.clientWidth - buffer) {
        container.scrollLeft += scrollSpeed;
        scrolled = true;
      }

      // Scroll left
      if (dx < buffer) {
        container.scrollLeft -= scrollSpeed;
        scrolled = true;
      }

      if (scrolled && this.lastMouseEvent) {
        this.updateSelectionFromMouse(mouseX, mouseY);
      }
    }, intervalTime);
  }
  private stopAutoScroll(): void {
    if (this.autoScrollInterval !== null) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  private handleClick = (e: MouseEvent): void => {
    if (this.isDragging) return;
    if (Date.now() < this.suppressHeaderClick) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const container = document.getElementById("container")!;
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const headerHeight = this.grid.rowHeights[0];
    const rowHeaderWidth = this.grid.colWidths[0];

    if (y < headerHeight && x >= rowHeaderWidth) {
      this.grid.selectedCells = null;
      this.grid.selectedRow = null;

      const adjustedX = x + scrollLeft;
      const col = this.grid.getColFromX(adjustedX);
      this.grid.selectedColumn = col > 0 ? col : null;
    
      this.grid.redraw();
    } else if (x < rowHeaderWidth && y >= headerHeight) {
      this.grid.selectedCells = null;
      this.grid.selectedColumn = null;

      const adjustedY = y + scrollTop;
      const row = this.grid.getRowFromY(adjustedY);
      this.grid.selectedRow = row > 0 ? row : null;
     
      
      this.grid.redraw();
    } else if (x < rowHeaderWidth && y < headerHeight) {
      this.grid.selectedCells = null;
      this.grid.selectedColumn = null;
      this.grid.selectedRow = null;
      this.grid.redraw();
    } 
  }; 
  
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.grid.selectedCells || !e.shiftKey) return;

    let endRow = this.grid.selectedCells.endRow;
    let endCol = this.grid.selectedCells.endCol;

    const container = document.getElementById("container")!;

    if (e.ctrlKey) {
      switch (e.key) {
        case "ArrowDown":
          endRow = this.grid.totalRows - 1;
          container.scrollTop = container.scrollHeight;
          break;
        case "ArrowUp":
          endRow = 1; // Assuming row 0 is header
          container.scrollTop = 0;
          break;
        case "ArrowRight":
          endCol = this.grid.totalCols - 1;
          container.scrollLeft = container.scrollWidth;
          break;
        case "ArrowLeft":
          endCol = 1; // Assuming col 0 is header
          container.scrollLeft = 0;
          break;
        default:
          return;
      }
    } else {
      switch (e.key) {
        case "ArrowDown":
          if (this.anchorRow! < this.startRowDown!) this.anchorRow!++;
          else if (endRow < this.grid.totalRows - 1) endRow++;
          break;
        case "ArrowUp":
          if (endRow > this.startRowDown!) endRow--;
          else if (this.anchorRow! > 1) this.anchorRow!--;
          break;
        case "ArrowRight":
          if (this.anchorCol! < endCol && this.anchorCol !== this.startColDown) this.anchorCol!++;
          else if (endCol < this.grid.totalCols - 1) endCol++;
          break;
        case "ArrowLeft":
          if (endCol > this.startColDown!) endCol--;
          else if (this.anchorCol! > 1) this.anchorCol!--;
          break;
        default:
          return;
      }
    }

    e.preventDefault();

    this.grid.selectedCells = {
      startRow: Math.min(this.anchorRow!, endRow),
      endRow: Math.max(this.anchorRow!, endRow),
      startCol: Math.min(this.anchorCol!, endCol),
      endCol: Math.max(this.anchorCol!, endCol)
    };

    if (this.grid.onStatsUpdateCallback) {
      const stats = this.grid.computeSelectedCellStats();
      this.grid.onStatsUpdateCallback(stats);
    }

    this.grid.redraw();
  };

  public destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("click", this.handleClick);
    document.removeEventListener("keydown",this.handleKeyDown);
  }
}

