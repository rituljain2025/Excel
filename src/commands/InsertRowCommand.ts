// commands/InsertRowCommand.ts
import { Command } from "./command";
import { Grid } from "../grid";

/**
 * Command to insert a row into the grid.
 * Implements the Command interface to support undo-redo functionality.
 */
export class InsertRowCommand implements Command {
  /**
   * Stores the original data of the row being inserted,
   * keyed by column index. This backup allows restoring
   * the data on undo.
   * @type {Map<number, string>}
   */
  private backupRowData: Map<number, string> = new Map();

  /**
   * Initializes a new instance of the InsertRowCommand.
   * @param {Grid} grid - The grid instance where the row will be inserted.
   * @param {number} rowIndex - The index at which the row will be inserted.
   */
  constructor(private grid: Grid, private rowIndex: number) {}

  /**
   * Executes the command:
   * - Backs up the current data at the insertion row index.
   * - Inserts a new row into the grid.
   * - Redraws the grid to reflect the changes.
   */
  execute(): void {
    // Save the current data of the row being shifted
    this.backupRowData = this.grid.cloneRowData(this.rowIndex);

    // Insert row
    this.grid.insertRow(this.rowIndex);
    this.grid.redraw();
  }

  /**
   * Undoes the row insertion:
   * - Removes the newly inserted row.
   * - Restores the previously saved data at that index.
   * - Redraws the grid to reflect the restoration.
   */
  undo(): void {
    // Remove the inserted row
    this.grid.removeRow(this.rowIndex);

    // Restore original row data
    this.grid.restoreRowData(this.rowIndex, this.backupRowData);
    this.grid.redraw();
  }
}
