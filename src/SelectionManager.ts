// SelectionManager.ts
import { Grid } from './grid.js';

export class SelectionManager {
  private isDragging = false;
  private dragStartRow = -1;
  private dragStartCol = -1;
  private suppressHeaderClick = 0;

  constructor(private canvas: HTMLCanvasElement, private grid: Grid) {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("click", this.handleClick);
  }

  public suppressNextHeaderClick(): void {
    this.suppressHeaderClick = Date.now() + 60;
  }

  private handleMouseDown = (e: MouseEvent): void => {
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
        if (this.grid.onStatsUpdateCallback) {
          const stats = this.grid.computeSelectedCellStats();
          this.grid.onStatsUpdateCallback(stats);
        }
        this.grid.redraw();
      }
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const headerHeight = this.grid.rowHeights[0];
    const rowHeaderWidth = this.grid.colWidths[0];

    if (x >= rowHeaderWidth && y >= headerHeight) {
      const { row, col } = this.grid.getCellFromCoordinates(x, y);

      if (row > 0 && col > 0 && row < this.grid.totalRows && col < this.grid.totalCols) {
        if (this.grid.selectedCells) {
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
  };

  private handleMouseUp = (e: MouseEvent): void => {
    if (this.isDragging) {
      this.isDragging = false;
    }
  };

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

  public destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("click", this.handleClick);
  }
}
