import { Grid } from "./grid";

export class ColumnSelectionHandler {
  private isDragging = false;
  private startCol = -1;
  private endCol = -1;

  constructor(private canvas: HTMLCanvasElement, private grid: Grid) {
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
  }

  private onMouseDown = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const container = document.getElementById("container")!;
    const scrollLeft = container.scrollLeft;
    const headerHeight = this.grid.getRowHeight(0);
    const rowHeaderWidth = this.grid.getColWidth(0);
    
    // Only trigger if clicking on the column header (not row header)
    if (y < headerHeight && x >= rowHeaderWidth) {
      const adjustedX = x + scrollLeft;
      const col = this.grid.getColFromX(adjustedX);
      if (col > 0) {
        this.isDragging = true;
        this.startCol = this.endCol = col;
        this.grid.clearSelection();
        this.grid.setColumnRangeSelection(this.startCol, this.endCol);
        this.grid.redraw();
      }
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const container = document.getElementById("container")!;
    const scrollLeft = container.scrollLeft;
    const adjustedX = x + scrollLeft;

    const col = this.grid.getColFromX(adjustedX);
    if (col > 0) {
      this.endCol = col;
      const start = Math.min(this.startCol, this.endCol);
      const end = Math.max(this.startCol, this.endCol);
      this.grid.setColumnRangeSelection(start, end);
      this.grid.redraw();
    }
  };

  private onMouseUp = (_e: MouseEvent) => {
    if (this.isDragging) {
      this.isDragging = false;
      this.grid.suppressNextHeaderClick(); 
      console.log("Column range selected:", this.startCol, "to", this.endCol);
    }
  };
}
