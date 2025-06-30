import { Command } from "./command";
import { Grid } from "../grid";

/**
 * Command to delete a row from the grid.
 * Implements the Command interface to support undo-redo operations.
 */
export class DeleteRowCommand implements Command {
  /**
   * Stores the data of the deleted row, keyed by column index.
   * This is used to restore the row during an undo operation.
   * @type {Map<number, string>}
   */
  private deletedRowData: Map<number, string> = new Map();

  /**
   * Initializes a new instance of the DeleteRowCommand.
   * @param {Grid} grid - The grid instance where the row will be deleted.
   * @param {number} rowIndex - The index of the row to delete.
   */
  constructor(private grid: Grid, private rowIndex: number) {}

  /**
   * Executes the command to delete the specified row:
   * - Clones and stores the row's data for undo.
   * - Removes the row from the grid.
   * - Triggers a redraw of the grid.
   */
  execute(): void {
    // Backup the row data before deleting
    this.deletedRowData = this.grid.cloneRowData(this.rowIndex);

    this.grid.removeRow(this.rowIndex);
    this.grid.redraw();
  }

  /**
   * Undoes the row deletion:
   * - Reinserts the row at the original position.
   * - Restores the previously backed-up row data.
   * - Triggers a redraw of the grid.
   */
  undo(): void {
    this.grid.insertRow(this.rowIndex);
    this.grid.restoreRowData(this.rowIndex, this.deletedRowData);
    this.grid.redraw();
  }
}
