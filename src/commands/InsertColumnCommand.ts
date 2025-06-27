// commands/InsertColumnCommand.ts
import { Command } from "./command";
import { Grid } from "../grid";

export class InsertColumnCommand implements Command {
  private backupColData: Map<number, string> = new Map();

  constructor(private grid: Grid, private colIndex: number) {}

  execute(): void {
    this.backupColData = this.grid.cloneColumnData(this.colIndex);
    this.grid.insertColumn(this.colIndex);
    this.grid.redraw();
  }

  undo(): void {
    this.grid.removeColumn(this.colIndex);
    this.grid.restoreColumnData(this.colIndex, this.backupColData);
    this.grid.redraw();
  }
}
