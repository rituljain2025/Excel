import { ResizeRowCommand } from "./commands/ResizeRowCommand.js";
import { Grid } from "./grid.js";
import { UndoManager } from "./commands/UndoManager.js";
import { EventHandler } from "./EventHandler.js";


/**
 * Handles mouse-based row resizing functionality in the grid.
 */
export class RowResizeHandler implements EventHandler {
  /** Whether the user is actively resizing a row */
  private isResizing = false;

  /** Y position where resizing started */
  private startY = 0;

  /** Initial height of the row before resize started */
  private startHeight = 0;

  /** Index of the row currently being resized */
  private targetRow = -1;

  /** Whether the mouse is currently hovering near a row border */
  private isHovering = false;

  /** Tracks the final height of the row being resized */
  private currentRowHeight: number = 0;

  /** Whether multi-row resize is enabled */
  private isMultiRowResize: boolean = false;

  /**
   * @param canvas The canvas element used for rendering the grid
   * @param grid The Grid instance for cell data and rendering
   * @param undoManager The UndoManager to support undo-redo of row resizing
   */
  constructor(
      private canvas: HTMLCanvasElement,
      private grid: Grid,
      private undoManager: UndoManager) {}

  /**
   * Calculates the visible range of rows in the canvas based on scroll position
   * @param scrollTop The vertical scroll offset
   * @returns An object with the `start` and `end` visible row indices
   */
  private getVisibleRowRange(scrollTop: number): { start: number; end: number } {
    const canvasHeight = this.canvas.height;
    const buffer = 100;

    let start = 1;
    for (let i = 1; i < this.grid.totalRows; i++) {
      const rowTop = this.grid.getRowY(i);
      const relativeY = rowTop - scrollTop;
      if (relativeY >= -buffer) {
        start = i;
        break;
      }
    }

    let end = this.grid.totalRows;
    for (let i = start; i < this.grid.totalRows; i++) {
      const rowTop = this.grid.getRowY(i);
      const relativeY = rowTop - scrollTop;
      if (relativeY > canvasHeight + buffer) {
        end = i;
        break;
      }
    }

    return { start, end };
  }
  /**
   * Triggered on mouse down — starts resizing if near row border in header area
   */
  public onMouseDown = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) ;
    const y = (e.clientY - rect.top);
    const container = document.getElementById("container")!;
    const scrollTop = container.scrollTop;
    const rowHeaderWidth = this.grid.getColWidth(0);

    // Only allow resizing in the row header area
    if (x >= rowHeaderWidth) return;

    const { start, end } = this.getVisibleRowRange(scrollTop);

    for (let i = start; i < end; i++) {
      const rowTop = this.grid.getRowY(i);
      const rowHeight = this.grid.getRowHeight(i);
      const relativeY = rowTop - scrollTop;
      const rowBottom = relativeY + rowHeight;

      if (y >= rowBottom - 5 && y <= rowBottom + 5) {
        // Determine if multi-row resize should be enabled
        let isMultiRowSelected = false;
        if (
          this.grid.selectionMode === "row" &&
          this.grid.selectedCells &&
          this.grid.selectedCells.startRow !== this.grid.selectedCells.endRow &&
          i >= this.grid.selectedCells.startRow &&
          i <= this.grid.selectedCells.endRow
        ) {
          isMultiRowSelected = true;
        }
        this.isMultiRowResize = isMultiRowSelected;
        this.isResizing = true;
        (this.canvas as any)._isRowResizing = true;
        this.startY = y;
        this.startHeight = rowHeight;
        this.targetRow = i;
        this.currentRowHeight = rowHeight;
        this.canvas.style.cursor = "row-resize";
        document.addEventListener("mousemove", this.onMouseMoveResize);
        document.addEventListener("mouseup", this.onMouseUp);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
  };
  /**
   * Triggered on mouse move — updates the cursor to row-resize when hovering near row border
   */
  public onMouseMove = (e: MouseEvent) => {
    if (this.isResizing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) ;
    const y = (e.clientY - rect.top) ;

    const container = document.getElementById("container")!;
    const scrollTop = container.scrollTop;
    const rowHeaderWidth = this.grid.getColWidth(0);

    if (x >= rowHeaderWidth) {
      if (this.isHovering) {
        this.canvas.style.cursor = "default";
        this.isHovering = false;
      }
      return;
    }

    const { start, end } = this.getVisibleRowRange(scrollTop);

    for (let i = start; i < end; i++) {
      const rowTop = this.grid.getRowY(i);
      const rowHeight = this.grid.getRowHeight(i);
      const relativeY = rowTop - scrollTop;
      const rowBottom = relativeY + rowHeight;

      if (y >= rowBottom - 5 && y <= rowBottom + 5) {
        this.canvas.style.cursor = "row-resize";
        this.isHovering = true;
        return;
      }
    }

    if (this.isHovering) {
      this.canvas.style.cursor = "default";
      this.isHovering = false;
    }
  };
  /**
   * Triggered when the mouse leaves the canvas — resets the cursor
   */
  public onMouseLeave = (e: MouseEvent) => {
    if (!this.isResizing && this.isHovering) {
      this.canvas.style.cursor = "default";
      this.isHovering = false;
    }
  };
  /**
   * Handles resizing logic during mouse drag movement
   */
  private onMouseMoveResize = (e: MouseEvent) => {
    if (!this.isResizing) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentY =( e.clientY - rect.top) ;
    const delta = currentY - this.startY;
    const newHeight = this.startHeight + delta;

   
    if (newHeight >= 20 && newHeight <= 200) {
      if (this.isMultiRowResize && this.grid.selectedCells) {
        for (let row = this.grid.selectedCells.startRow; row <= this.grid.selectedCells.endRow; row++) {
          this.grid.setRowHeight(row, newHeight);
        }
      } else {
        this.grid.setRowHeight(this.targetRow, newHeight);
      }
      this.currentRowHeight = newHeight;
    }
  };
  /**
   * Triggered on mouse up — ends resize and pushes command to undo stack
   */
  public onMouseUp = (e: MouseEvent) => {
    if (this.isResizing) {
      if(this.startHeight !== this.currentRowHeight){
        if (this.isMultiRowResize && this.grid.selectedCells) {
          for (let row = this.grid.selectedCells.startRow; row <= this.grid.selectedCells.endRow; row++) {
            this.grid.setRowHeight(row, this.startHeight); // reset for undo consistency
            const cmd = new ResizeRowCommand(this.grid, this.startHeight, this.currentRowHeight, row);
            this.undoManager.executeCommand(cmd);
          }
        } else {
          this.grid.setRowHeight(this.targetRow, this.startHeight); // reset for undo consistency
          const cmd = new ResizeRowCommand(this.grid, this.startHeight, this.currentRowHeight, this.targetRow);
          this.undoManager.executeCommand(cmd);
        }
      }
      (this.canvas as any)._isRowResizing = false;
      this.isResizing = false;
      this.targetRow = -1;
      this.currentRowHeight = 0;
      this.canvas.style.cursor = "default";
      this.isHovering = false;
      document.removeEventListener("mousemove", this.onMouseMoveResize);
      document.removeEventListener("mouseup", this.onMouseUp);
    }
  };
  public getCursor(x :number,y:number): string {
    return "row-resize";
  }
  public hitTest(x: number, y: number): boolean {
    const rowHeaderWidth = this.grid.getColWidth(0);
    if (x > rowHeaderWidth) return false;

    const container = document.getElementById("container")!;
    const scrollTop = container.scrollTop;
    const adjustedY = y + scrollTop;
    let cumulativeY = 0;
    const tolerance = 5;

    for (let row = 0; row < this.grid.totalRows; row++) {
      const height = this.grid.getRowHeight(row);
      const bottomEdge = cumulativeY + height;

      if (Math.abs(adjustedY - bottomEdge) <= tolerance) {
        return true;
      }

      cumulativeY += height;
      if (cumulativeY > adjustedY + this.canvas.clientHeight) {
        break;
      }
    }

    return false;
  }
}
