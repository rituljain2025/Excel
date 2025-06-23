import { Grid } from "./grid";

export class CellEditor {
  constructor(private canvas: HTMLCanvasElement, private grid: Grid) {
    this.canvas.addEventListener("dblclick", this.onDoubleClick);
  }

  private onDoubleClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const container = document.getElementById("container")!;
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;

    let col = -1, row = -1;
    let xPos = 0, yPos = 0;

    // Find column
    for (let j = 0; j < this.grid.totalCols; j++) {
      const w = this.grid.getColWidth(j);
      if (x >= xPos - scrollLeft && x <= xPos + w - scrollLeft) {
        col = j;
        break;
      }
      xPos += w;
    }

    // Find row
    for (let i = 0; i < this.grid.totalRows; i++) {
      const h = this.grid.getRowHeight(i);
      if (y >= yPos - scrollTop && y <= yPos + h - scrollTop) {
        row = i;
        break;
      }
      yPos += h;
    }

    if (col === -1 || row === -1) return;

    const cellX = this.grid.getColumnX(col) - scrollLeft;
    const cellY = this.grid.getRowY(row) - scrollTop;
    const cellW = this.grid.getColWidth(col);
    const cellH = this.grid.getRowHeight(row);

    const input = document.createElement("input");
    input.type = "text";
    input.value = this.grid.getCellData(row, col) || "";
    input.style.position = "absolute";
    input.style.left = `${cellX + rect.left}px`;
    input.style.top = `${cellY + rect.top}px`;
    input.style.width = `${cellW - 2}px`;
    input.style.height = `${cellH - 2}px`;
    input.style.fontSize = "12px";
    input.style.border = "1px solid #333";
    input.style.padding = "0";
    input.style.margin = "0";
    input.style.zIndex = "1000";

    document.body.appendChild(input);
    input.focus();

    const saveAndCleanup = () => {
      this.grid.setCellData(row, col, input.value);
      document.body.removeChild(input);
    };

    input.addEventListener("blur", saveAndCleanup);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        saveAndCleanup();
      }
    });
  };
}
