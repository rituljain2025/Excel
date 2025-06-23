export interface SelectionBounds {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export class SelectionManager {
  private isMouseDown: boolean = false;
  public isDragging: boolean = false;

  private startRow: number = 0;
  private startCol: number = 0;
  private endRow: number = 0;
  private endCol: number = 0;

  private selection: SelectionBounds | null = null;

  /**
   * Handles pointer down (mouse click or drag start)
   */
  public handlePointerDown(x: number, y: number, colWidths: number[], rowHeights: number[]): void {
    this.isMouseDown = true;
    this.isDragging = true;

    const col = this.getColFromX(x, colWidths);
    const row = this.getRowFromY(y, rowHeights);

    this.startCol = col;
    this.startRow = row;
    this.endCol = col;
    this.endRow = row;

    this.updateSelection();
  }

  /**
   * Handles pointer move (dragging)
   */
  public handlePointerMove(x: number, y: number, colWidths: number[], rowHeights: number[]): void {
    if (!this.isMouseDown) return;

    this.endCol = this.getColFromX(x, colWidths);
    this.endRow = this.getRowFromY(y, rowHeights);
    this.updateSelection();
  }

  /**
   * Handles pointer up (mouse release)
   */
  public handlePointerUp(): void {
    this.isMouseDown = false;
    this.isDragging = false;
  }

  /**
   * Returns current selection bounds
   */
  public getSelectionBounds(): SelectionBounds | null {
    return this.selection;
  }

  /**
   * Converts x pixel to column index
   */
  private getColFromX(x: number, colWidths: number[]): number {
    let acc = 0;
    for (let i = 0; i < colWidths.length; i++) {
      acc += colWidths[i];
      if (x < acc) return i;
    }
    return colWidths.length - 1;
  }

  /**
   * Converts y pixel to row index
   */
  private getRowFromY(y: number, rowHeights: number[]): number {
    let acc = 0;
    for (let i = 0; i < rowHeights.length; i++) {
      acc += rowHeights[i];
      if (y < acc) return i;
    }
    return rowHeights.length - 1;
  }

  /**
   * Calculates the current selection bounds
   */
  private updateSelection(): void {
    const top = Math.min(this.startRow, this.endRow);
    const bottom = Math.max(this.startRow, this.endRow);
    const left = Math.min(this.startCol, this.endCol);
    const right = Math.max(this.startCol, this.endCol);

    this.selection = { top, bottom, left, right };
  }

  /**
   * Used to support column header click to select whole column
   */
  public selectEntireColumn(col: number, totalRows: number): void {
    this.selection = {
      top: 1,         // skip header row
      bottom: totalRows - 1,
      left: col,
      right: col,
    };
  }
}

