// commands/InsertColumnCommand.ts
import { Command } from "./command";
import { Grid } from "../grid";

/**
 * Command to insert a column into the grid.
 * Implements the Command interface to support undo-redo functionality.
 */
export class InsertColumnCommand implements Command {
  /**
   * Stores the original data of the column being inserted,
   * keyed by row index. This backup allows restoring the data on undo.
   * @type {Map<number, string>}
   */
  private backupColData: Map<number, string> = new Map();

  /**
   * Initializes a new instance of the InsertColumnCommand.
   * @param {Grid} grid - The grid instance where the column will be inserted.
   * @param {number} colIndex - The index at which the column will be inserted.
   */
  constructor(private grid: Grid, private colIndex: number) {}

  /**
   * Executes the command:
   * - Clones and stores the current column data (if any).
   * - Inserts a new column at the specified index.
   * - Triggers a redraw of the grid.
   */
  execute(): void {
    this.backupColData = this.grid.cloneColumnData(this.colIndex);
    this.grid.insertColumn(this.colIndex);
    this.grid.redraw();
  }

  /**
   * Undoes the column insertion:
   * - Removes the inserted column.
   * - Restores the previously saved data into the original column index.
   * - Triggers a redraw of the grid.
   */
  undo(): void {
    this.grid.removeColumn(this.colIndex);
    this.grid.restoreColumnData(this.colIndex, this.backupColData);
    this.grid.redraw();
  }
}
