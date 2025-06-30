import { Command } from "./command";
import { Grid } from "../grid";

export class SetCellStyleCommand implements Command {
  private previousStyle: { bold?: boolean; italic?: boolean } | undefined;

  constructor(
    private grid: Grid,
    private row: number,
    private col: number,
    private newStyle: { bold?: boolean; italic?: boolean }
  ) {
    this.previousStyle = grid.getCellStyle(row, col);
  }

  execute(): void {
    const currentStyle = this.grid.getCellStyle(this.row, this.col) || {};
    const mergedStyle = { ...currentStyle, ...this.newStyle };
    this.grid.setCellStyle(this.row, this.col, mergedStyle);
    this.grid.redraw();
  }

  undo(): void {
    this.grid.setCellStyle(this.row, this.col, this.previousStyle || {});
    this.grid.redraw();
  }
}
