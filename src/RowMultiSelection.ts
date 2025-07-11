import { EventHandler } from "./EventHandler.js";
import { Grid } from "./grid.js";

/**
 * Handles drag-based multiple row selection in the grid.
 */
export class RowMultiSelection implements EventHandler{
  /** Whether a row selection drag operation is currently in progress */
  private isDragging = false;

  /** The row index where the drag started */
  private dragStartRow = -1;

  /** The row index where the drag currently ends */
  private dragEndRow = -1;
  private autoScrollInterval: number | null = null;
  private lastMouseEvent:MouseEvent | null = null;
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
    const x =( e.clientX - rect.left);
    const y =( e.clientY - rect.top);
   
   
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
        this.grid.isRowDragging = true;
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
     this.lastMouseEvent = e;
    const rect = this.canvas.getBoundingClientRect();
    const y = (e.clientY - rect.top);
    const container = document.getElementById("container")!;
    const scrollTop = container.scrollTop;
    const adjustedY = y + scrollTop;

    const row = this.grid.getRowFromY(adjustedY);
    if (row > 0) {
      this.dragEndRow = row;
      const start = Math.min(this.dragStartRow, this.dragEndRow);
      const end = Math.max(this.dragStartRow, this.dragEndRow);
      this.startAutoScroll();
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
      this.stopAutoScroll();
      this.isDragging = false;
      this.grid.isRowDragging = false;
    }
  };
  private startAutoScroll():void {
    if(this.autoScrollInterval !== null) return; // Prevent multiple intervals

    const container = document.getElementById("container")!;
    const buffer = 50; // Distance from edge to trigger scroll
    const scrollSpeed = 10; // Pixels to scroll per interval
    const intervalTime = 50; // Interval time in ms
    
    this.autoScrollInterval = window.setInterval(() =>{
       if(!this.isDragging || !this.lastMouseEvent) return;

       const rect = this.canvas.getBoundingClientRect();
       const dy = (this.lastMouseEvent.clientY - rect.top);
       let scrolled = false;

       if(dy < buffer){
          container.scrollTop -= scrollSpeed;
          scrolled = true;
       }
       if(dy > container.clientHeight - buffer){
          container.scrollTop += scrollSpeed;
          scrolled = true;
       }
       if(scrolled){
          const adjustedY = this.lastMouseEvent.clientY + container.scrollTop - rect.top;
          const row = this.grid.getRowFromY(adjustedY);
          if (row > 0) {
            this.dragEndRow = row;
            const start = Math.min(this.dragStartRow, this.dragEndRow);
            const end = Math.max(this.dragStartRow, this.dragEndRow);
            this.grid.setRowRangeSelection(start, end);
            this.grid.redraw();
          }
       }
    })
  }
  private stopAutoScroll(): void {
      if (this.autoScrollInterval !== null) {
          clearInterval(this.autoScrollInterval);
          this.autoScrollInterval = null;
      }
  }
  public getCursor(x :number,y:number): string {
    return "cell";
  }
  public hitTest(x: number, y: number): boolean {
    const headerHeight = this.grid.getRowHeight(0);
    const rowHeaderWidth = this.grid.getColWidth(0);
    return y >= headerHeight && x < rowHeaderWidth; 
  }
}
