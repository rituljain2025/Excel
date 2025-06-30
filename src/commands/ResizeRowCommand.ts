import { Grid } from "../grid.js";
import { Command } from "./command.js";

/**
 * Command to resize a specific row in the grid.
 * Implements the Command interface to support undo-redo functionality.
 */
export class ResizeRowCommand implements Command {

  /**
   * Initializes a new instance of the ResizeRowCommand.
   * @param {Grid} grid - The grid instance where the row will be resized.
   * @param {number} oldHeigt - The original height of the row (before resize).
   * @param {number} newHeight - The new height to set for the row.
   * @param {number} rowIndex - The index of the row to resize.
   */
  constructor(
    private grid: Grid,
    private oldHeigt: number,
    private newHeight: number,
    private rowIndex: number
  ) {}

  /**
   * Executes the row resize:
   * - Sets the specified row's height to the new height.
   * - Redraws the grid to reflect the updated layout.
   */
  execute(): void {
    this.grid.setRowHeight(this.rowIndex, this.newHeight);
    this.grid.redraw();
  }

  /**
   * Undoes the row resize:
   * - Restores the original height of the row.
   * - Redraws the grid to reflect the restored size.
   */
  undo(): void {
    this.grid.setRowHeight(this.rowIndex, this.oldHeigt);
    this.grid.redraw();
  }
}
