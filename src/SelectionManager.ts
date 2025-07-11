// SelectionManager.ts
import { EventHandler } from './EventHandler.js';
import { Grid } from './grid.js';

/**
 * Manages cell selection, column/row selection, drag selection,
 * keyboard-based selection extension, and auto-scrolling during drag.
 */
export class SelectionManager  implements EventHandler{
  // Selection state flags and tracking variables
  private isDragging = false;
  private dragStartRow = -1;
  private dragStartCol = -1;
  private suppressHeaderClick = 0;
  private autoScrollInterval: number | null = null;
  private lastMouseEvent: MouseEvent | null = null;

  // Anchor and initial coordinates for shift-based and drag selections
  private anchorRow: number | null = null;
  private anchorCol: number | null = null;
  private startRowDown: number | null = null;
  private startColDown: number | null = null;

  constructor(private canvas: HTMLCanvasElement, private grid: Grid) {}

  public hitTest(x:number, y:number): boolean {
    const rect = this.canvas.getBoundingClientRect();
    const localX = (x - rect.left) ;
    const localY = (y - rect.top);
    const headerHeight = this.grid.rowHeights[0];
    const rowHeaderWidth = this.grid.colWidths[0];

    return localX >= rowHeaderWidth && localY >= headerHeight &&
           localX < this.canvas.width && localY < this.canvas.height;
  }
  public getCursor(x :number,y:number): string {
    return "cell";
  }
  // Handle mouse down to start drag selection
  public onMouseDown = (e: MouseEvent): void => {
    if ((this.canvas as any)._isResizing || (this.canvas as any)._isRowResizing) return;
    if (Date.now() < this.suppressHeaderClick) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top) ;
    const headerHeight = this.grid.rowHeights[0];
    const rowHeaderWidth = this.grid.colWidths[0];

    // Only trigger selection if clicked inside grid body
    if (x >= rowHeaderWidth && y >= headerHeight) {
      const { row, col } = this.grid.getCellFromCoordinates(x, y);
      if (row > 0 && col > 0 && row < this.grid.totalRows && col < this.grid.totalCols) {
        this.isDragging = true;
        this.dragStartRow = row;
        this.dragStartCol = col;

        // Clear row/column selections
        this.grid.selectedColumn = null;
        this.grid.selectedRow = null;
        this.grid.selectionMode = "cell"; // selectionMode is set

        // Set initial cell selection
        this.grid.selectedCells = {
          startRow: row,
          startCol: col,
          endRow: row,
          endCol: col
        };

        // Set anchors for shift-based keyboard selection
        this.anchorRow = row;
        this.anchorCol = col;
        this.startRowDown = row;
        this.startColDown = col;

        this.startAutoScroll();

        // Update stats if needed
        if (this.grid.onStatsUpdateCallback) {
          const stats = this.grid.computeSelectedCellStats();
          this.grid.onStatsUpdateCallback(stats);
        }

        this.grid.redraw();
      }
    }
  };
 

  // Update selection area during drag
  private updateSelectionFromMouse(x: number, y: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const localX = (x - rect.left) ;
    const localY = (y - rect.top) ;
    const headerHeight = this.grid.rowHeights[0];
    const rowHeaderWidth = this.grid.colWidths[0];

    if (localX >= rowHeaderWidth && localY >= headerHeight) {
      const { row, col } = this.grid.getCellFromCoordinates(localX, localY);
      if (row > 0 && col > 0 && row < this.grid.totalRows && col < this.grid.totalCols && this.grid.selectedCells) {
        // Update selection bounds
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

  // Handle mouse move to update selection box
  public onMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;
    this.lastMouseEvent = e;
    this.updateSelectionFromMouse(e.clientX, e.clientY);
  };

  // End drag selection on mouse up
  public onMouseUp = (e: MouseEvent): void => {
    this.stopAutoScroll();
    if (this.isDragging) {
      this.isDragging = false;
    }
  };

  // Enable auto-scroll when dragging near canvas edge
  private startAutoScroll(): void {
    if (this.autoScrollInterval !== null) return;
    const container = document.getElementById("container")!;
    const scrollSpeed = 30;
    const buffer = 50;
    const intervalTime = 20;

    this.autoScrollInterval = window.setInterval(() => {
      if (!this.isDragging || !this.lastMouseEvent) return;

      const rect = this.canvas.getBoundingClientRect();
      const dx = (this.lastMouseEvent.clientX - rect.left);
      const dy = (this.lastMouseEvent.clientY - rect.top);
      let scrolled = false;

      if (dy > container.clientHeight - buffer) {
        container.scrollTop += scrollSpeed;
        scrolled = true;
      }
      if (dy < buffer) {
        container.scrollTop -= scrollSpeed;
        scrolled = true;
      }
      if (dx > container.clientWidth - buffer) {
        container.scrollLeft += scrollSpeed;
        scrolled = true;
      }
      if (dx < buffer) {
        container.scrollLeft -= scrollSpeed;
        scrolled = true;
      }

      if (scrolled) {
        this.updateSelectionFromMouse(this.lastMouseEvent.clientX, this.lastMouseEvent.clientY);
      }
    }, intervalTime);
  }

  // Stop auto-scroll
  private stopAutoScroll(): void {
    if (this.autoScrollInterval !== null) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  // Handle clicks on column/row headers or grid body
  private handleClick = (e: MouseEvent): void => {
   
    // If we are resizing, do not handle clicks
    if ((this.canvas as any)._isResizing || (this.canvas as any)._isRowResizing) return;
    if (this.isDragging || Date.now() < this.suppressHeaderClick) return;
    

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) ;
    const y = (e.clientY - rect.top) ;

    const container = document.getElementById("container")!;
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const headerHeight = this.grid.rowHeights[0];
    const rowHeaderWidth = this.grid.colWidths[0];

    if (y < headerHeight && x >= rowHeaderWidth) {
      // Clicked on column header
      this.grid.selectedCells = null;
      this.grid.selectedRow = null;
      const col = this.grid.getColFromX(x + scrollLeft);
      this.grid.selectedColumn = col > 0 ? col : null;
      this.grid.selectionMode = "column"; // selectionMode is set
    } 
    else if (x < rowHeaderWidth && y >= headerHeight) {
      // Clicked on row header
      this.grid.selectedCells = null;
      this.grid.selectedColumn = null;
      const row = this.grid.getRowFromY(y + scrollTop);
      this.grid.selectedRow = row > 0 ? row : null;
      this.grid.selectionMode = "row"; // selectionMode is set
    }
    else if (x < rowHeaderWidth && y < headerHeight) {
      // Clicked on top-left cell
      this.grid.selectedCells = null;
      this.grid.selectedColumn = null;
      this.grid.selectedRow = null;
      this.grid.selectionMode = "cell"; // selectionMode is set
    }

    this.grid.redraw();
  };

  // Handle Shift+Arrow and Ctrl+Arrow based selection extension
  public handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.grid.selectedCells || !e.shiftKey) return;

    let endRow = this.grid.selectedCells.endRow;
    let endCol = this.grid.selectedCells.endCol;
    const container = document.getElementById("container")!;

    if (e.ctrlKey) {
      switch (e.key) {
        case "ArrowDown": endRow = this.grid.totalRows - 1; container.scrollTop = container.scrollHeight; break;
        case "ArrowUp": endRow = 1; container.scrollTop = 0; break;
        case "ArrowRight": endCol = this.grid.totalCols - 1; container.scrollLeft = container.scrollWidth; break;
        case "ArrowLeft": endCol = 1; container.scrollLeft = 0; break;
        default: return;
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

    // Update selected cell range
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

 
}
