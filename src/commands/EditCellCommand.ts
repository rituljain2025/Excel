import { Command } from "./command";
import { Grid } from "../grid";

/**
 * Command to edit the value of a single cell in the grid.
 * Implements the Command interface to support undo-redo operations.
 */
export class EditCellCommand implements Command {
  /**
   * Initializes a new EditCellCommand instance.
   * @param {Grid} grid - The grid where the edit is performed.
   * @param {number} row - The row index of the cell to edit.
   * @param {number} col - The column index of the cell to edit.
   * @param {string} oldValue - The original value before editing.
   * @param {string} newValue - The new value to set during execution.
   */
  constructor(
    private grid: Grid,
    private row: number,
    private col: number,
    private oldValue: string,
    private newValue: string
  ) {}

  /**
   * Executes the command by updating the cell with the new value
   * and redrawing the grid.
   */
  execute(): void {
    this.grid.setCellData(this.row, this.col, this.newValue);
    this.grid.redraw();
  }

  /**
   * Undoes the cell edit by restoring the original value
   * and redrawing the grid.
   */
  undo(): void {
    this.grid.setCellData(this.row, this.col, this.oldValue);
    this.grid.redraw();
  }
}
