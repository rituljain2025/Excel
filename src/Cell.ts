export class Cell {
  value: string;
  style: { bold?: boolean; italic?: boolean };

  constructor(value: string = "", style: { bold?: boolean; italic?: boolean } = {}) {
    this.value = value;
    this.style = style;
  }
}