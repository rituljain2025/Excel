import { Command } from "./command";
import { Grid } from "../grid";

export class EditCellCommand implements Command {
  constructor(
    private grid: Grid,
    private row: number,
    private col: number,
    private oldValue: string,
    private newValue: string
  ) {}

  execute(): void {
    this.grid.setCellData(this.row, this.col, this.newValue);
    this.grid.redraw();
  }

  undo(): void {
    this.grid.setCellData(this.row, this.col, this.oldValue);
    this.grid.redraw();
  }
}
