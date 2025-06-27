// commands/ResizeColumnCommand.ts
import { Command } from './command.js';
import { Grid } from '../grid.js';

export class ResizeColumnCommand implements Command {
  private oldWidth: number;

  constructor(
    private grid: Grid,
    private colIndex: number,
    private newWidth: number
  ) {
    this.oldWidth = grid.getColWidth(colIndex); // Save previous width
  }

  execute(): void {
    this.grid.setColWidth(this.colIndex, this.newWidth);
    this.grid.redraw();
  }

  undo(): void {
    this.grid.setColWidth(this.colIndex, this.oldWidth);
    this.grid.redraw();
  }
}
