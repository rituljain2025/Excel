import { Command } from "./command";
import { Grid } from "../grid";

export class DeleteColumnCommand implements Command {
  private backupColumnData: Map<number, string> = new Map();

  constructor(private grid: Grid, private colIndex: number) {}

  execute(): void {
    // Backup all cell values in this column (by row)
    for (let row = 0; row < this.grid.totalRows; row++) {
      const value = this.grid.getCellData(row, this.colIndex);
      if (value !== undefined) {
        this.backupColumnData.set(row, value);
      }
    }

    this.grid.removeColumn(this.colIndex);
    this.grid.setSelectedColumn(null); // clear selection
    this.grid.redraw();
  }

  undo(): void {
    this.grid.insertColumn(this.colIndex); // Reinsert the column

    // Restore backed-up values into that column
    for (const [row, value] of this.backupColumnData.entries()) {
      this.grid.setCellData(row, this.colIndex, value);
    }

    this.grid.redraw();
  }
}
