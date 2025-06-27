// commands/InsertRowCommand.ts
import { Command } from "./command";
import { Grid } from "../grid";

export class InsertRowCommand implements Command {
  private backupRowData: Map<number, string> = new Map();

  constructor(private grid: Grid, private rowIndex: number) {}

  execute(): void {
    // Save the current data of the row being shifted
    this.backupRowData = this.grid.cloneRowData(this.rowIndex);

    // Insert row
    this.grid.insertRow(this.rowIndex);
    this.grid.redraw();
  }

  undo(): void {
    // Remove the inserted row
    this.grid.removeRow(this.rowIndex);

    // Restore original row data
    this.grid.restoreRowData(this.rowIndex, this.backupRowData);
    this.grid.redraw();
  }
}
