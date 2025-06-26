import { Grid } from "./grid";

export class RowResizeHandler {
  private isResizing = false;
  private startY = 0;
  private startHeight = 0;
  private targetRow = -1;
  private isHovering = false;

  constructor(private canvas: HTMLCanvasElement, private grid: Grid) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Add event listeners to canvas
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mouseleave", this.onMouseLeave);
   
    this.canvas.style.cursor = "default";
  }

  private getVisibleRowRange(scrollTop: number): { start: number; end: number } {
    const canvasHeight = this.canvas.height;
    const buffer = 100; 
    
    // Find the first visible row
    let start = 1;
    for (let i = 1; i < this.grid.totalRows; i++) {
      const rowTop = this.grid.getRowY(i);
      const relativeY = rowTop - scrollTop;
      if (relativeY >= -buffer) {
        start = i;
        break;
      }
    }
    
    // Find the last visible row
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


  private onMouseDown = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const container = document.getElementById("container")!;
    const scrollTop = container.scrollTop;
    
    // Get the row header width (first column width)
    const rowHeaderWidth = this.grid.getColWidth(0);
    
    console.log("Mouse down at:", x, y, "Row header width:", rowHeaderWidth, "ScrollTop:", scrollTop);
    
    // Only allow resizing if mouse is within the row header area
    if (x >= rowHeaderWidth) {
      console.log("Not in row header area");
      return; // Not in row header area, exit early
    }

    // Get visible row range for performance optimization
    const { start, end } = this.getVisibleRowRange(scrollTop);
    
    // Check if we're near a row border within the visible row range
    // We need to check in reverse order to prioritize the row whose bottom border we're actually near



    for (let i = start; i < end; i++) {
      const rowTop = this.grid.getRowY(i);
      const rowHeight = this.grid.getRowHeight(i);
      const relativeY = rowTop - scrollTop;
      const rowBottom = relativeY + rowHeight;

      console.log(`Row ${i}: absoluteTop=${rowTop}, relativeTop=${relativeY}, height=${rowHeight}, bottom=${rowBottom}, mouse=${y}`);

      // Check if mouse is near the bottom border of this row (within 5 pixels)
      // We're looking for the row whose bottom border we're near, so we resize that row
      if (y >= rowBottom - 5 && y <= rowBottom + 5) {
        console.log("Starting resize for row:", i, "at bottom border");
        this.isResizing = true;
        this.startY = y;
        this.startHeight = rowHeight;
        this.targetRow = i;

        this.canvas.style.cursor = "row-resize";
        // document.body.style.cursor = "row-resize";
        
        // Add global mouse events for resizing
        document.addEventListener("mousemove", this.onMouseMoveResize);
        document.addEventListener("mouseup", this.onMouseUp);
        
        // Prevent default to avoid interfering with other mouse handlers
        e.preventDefault();
        e.stopPropagation();
        return; // Exit immediately after finding the correct row
      }
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.isResizing) return; // Don't change cursor while resizing

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const container = document.getElementById("container")!;
    const scrollTop = container.scrollTop;
    
    // Get the row header width (first column width)
    const rowHeaderWidth = this.grid.getColWidth(0);
    
    // Only show resize cursor if mouse is within the row header area
    if (x >= rowHeaderWidth) {
      if (this.isHovering) {
        this.canvas.style.cursor = "default";
        this.isHovering = false;
      }
      return;
    }

    let foundResizeBorder = false;
    
    // Get visible row range for performance optimization
    const { start, end } = this.getVisibleRowRange(scrollTop);

    // Check if we're near a row border within the visible row range
    for (let i = start; i < end; i++) {
      const rowTop = this.grid.getRowY(i);
      const rowHeight = this.grid.getRowHeight(i);
      const relativeY = rowTop - scrollTop;
      const rowBottom = relativeY + rowHeight;

      // Check if mouse is near the bottom border of this row (within 5 pixels)
      if (y >= rowBottom - 5 && y <= rowBottom + 5) {
        this.canvas.style.cursor = "row-resize";
        this.isHovering = true;
        foundResizeBorder = true;
        break;
      }
    }

    if (!foundResizeBorder && this.isHovering) {
      this.canvas.style.cursor = "default";
      this.isHovering = false;
    }
  };

  private onMouseLeave = () => {
    if (!this.isResizing && this.isHovering) {
      this.canvas.style.cursor = "default";
      this.isHovering = false;
    }
  };

  private onMouseMoveResize = (e: MouseEvent) => {
    if (!this.isResizing) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentY = e.clientY - rect.top;
    const delta = currentY - this.startY;
    const newHeight = this.startHeight + delta;

    console.log("Resizing row", this.targetRow, "to height:", newHeight);
    this.grid.suppressNextHeaderClick();
    // Apply constraints for minimum and maximum row height
    if (newHeight >= 20 && newHeight <= 200) {
      this.grid.setRowHeight(this.targetRow, newHeight);
    }
  };

  private onMouseUp = () => {
    if (this.isResizing) {
      console.log("Ending resize");
      this.isResizing = false;
      this.targetRow = -1;
      
      this.canvas.style.cursor = "default";
      // document.body.style.cursor = "default";
      this.isHovering = false;
      
      // Remove global mouse events
      document.removeEventListener("mousemove", this.onMouseMoveResize);
      document.removeEventListener("mouseup", this.onMouseUp);
    }
  };

  // Clean up method to remove event listeners
  public destroy() {
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mouseleave", this.onMouseLeave);
    
    // Clean up any active resize operation
    if (this.isResizing) {
      document.removeEventListener("mousemove", this.onMouseMoveResize);
      document.removeEventListener("mouseup", this.onMouseUp);
      this.canvas.style.cursor = "default";
      document.body.style.cursor = "default";
    }
  }
}


