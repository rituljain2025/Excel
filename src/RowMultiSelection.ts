import { Grid } from "./grid.js";
import { RowResizeHandler } from "./rowResizeHandler.js";
import { SelectionManager } from "./SelectionManager.js";

/**
 * Handles drag-based multiple row selection in the grid.
 */
export class RowMultiSelection {
  /** Whether a row selection drag operation is currently in progress */
  private isDragging = false;

  /** The row index where the drag started */
  private dragStartRow = -1;

  /** The row index where the drag currently ends */
  private dragEndRow = -1;

  /**
   * @param canvas The HTML canvas used for drawing the grid
   * @param grid The Grid instance representing the data and drawing logic
   */
  constructor(private canvas: HTMLCanvasElement, private grid: Grid) {}

  /**
   * Handles mouse down event on the canvas to begin row drag selection
   */
  public onMouseDown = (e: MouseEvent) => {
    if ((this.canvas as any)._isRowResizing) return;
   
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // if(this.rowResizeHandler.isInRowResizeZone(x,y)) return; // Prevent conflict with row resizing
   
    const container = document.getElementById("container")!;
    const scrollTop = container?.scrollTop;

    const headerWidth = this.grid.getColWidth(0);
    const headerHeight = this.grid.getRowHeight(0);

    // Only trigger selection when mouse is within row header region
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

  /**
   * Handles mouse move event to update the selected row range while dragging
   */
  public onMouseMove = (e: MouseEvent) => {
    if ((this.canvas as any)._isRowResizing) return;
    if (!this.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const container = document.getElementById("container")!;
    const scrollTop = container.scrollTop;
    const adjustedY = y + scrollTop;

    const row = this.grid.getRowFromY(adjustedY);
    if (row > 0) {
      this.dragEndRow = row;
      const start = Math.min(this.dragStartRow, this.dragEndRow);
      const end = Math.max(this.dragStartRow, this.dragEndRow);
      this.grid.setRowRangeSelection(start, end);
      this.grid.redraw();
    }
  };

  /**
   * Handles mouse up event to finalize the row drag selection
   */
  public onMouseUp = (_e: MouseEvent) => {
    if ((this.canvas as any)._isRowResizing) return;

    if (this.isDragging) {
      this.isDragging = false;
    }
  };
  
  public destroy(): void {
      this.canvas.removeEventListener("mousedown", this.onMouseDown);
      this.canvas.removeEventListener("mousemove", this.onMouseMove);
      this.canvas.removeEventListener("mouseup", this.onMouseUp);
  }
}
