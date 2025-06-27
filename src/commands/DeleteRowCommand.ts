import { Command } from "./command";
import { Grid } from "../grid";

export class DeleteRowCommand implements Command {
  private deletedRowData: Map<number, string> = new Map();

  constructor(private grid: Grid, private rowIndex: number) {}

  execute(): void {
    // Backup the row data before deleting
    this.deletedRowData = this.grid.cloneRowData(this.rowIndex);

    this.grid.removeRow(this.rowIndex);
    this.grid.redraw();
  }

  undo(): void {
    this.grid.insertRow(this.rowIndex);
    this.grid.restoreRowData(this.rowIndex, this.deletedRowData);
    this.grid.redraw();
  }
}
