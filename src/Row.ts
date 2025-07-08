import { Cell } from "./Cell";

export class Row {
  cells: Map<number, Cell>;
  height: number;

  constructor(height: number = 25) {
    this.cells = new Map();
    this.height = height;
  }

  getCell(col: number): Cell | undefined {
    return this.cells.get(col);
  }

  setCell(col: number, cell: Cell) {
    this.cells.set(col, cell);
  }
}