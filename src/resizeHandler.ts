// import { Grid } from './grid.js';

// export class ResizeHandler {
//   private isResizing = false;
//   private startX = 0;
//   private startWidth = 0;

//   constructor(private canvas: HTMLCanvasElement, private grid: Grid) {
//     this.canvas.addEventListener("mousedown", this.onMouseDown);
//   }

//   private onMouseDown = (e: MouseEvent) => {
//     const rect = this.canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;

//     const colWidth = this.grid.getColWidth();
//     const offset = x % colWidth;

//     if (Math.abs(offset - colWidth) < 5) {
//       this.isResizing = true;
//       this.startX = x;
//       this.startWidth = colWidth;
//       document.body.style.cursor = "col-resize";

//       window.addEventListener("mousemove", this.onMouseMove);
//       window.addEventListener("mouseup", this.onMouseUp);
//     }
//   };

//   private onMouseMove = (e: MouseEvent) => {
//     if (!this.isResizing) return;

//     const rect = this.canvas.getBoundingClientRect();
//     const currentX = e.clientX - rect.left;
//     const delta = currentX - this.startX;
//     const newWidth = this.startWidth + delta;

//     if (newWidth >= 30 && newWidth <= 500) {
//       this.grid.setColWidth(newWidth);
//     }
//   };

//   private onMouseUp = () => {
//     this.isResizing = false;
//     document.body.style.cursor = "default";
//     window.removeEventListener("mousemove", this.onMouseMove);
//     window.removeEventListener("mouseup", this.onMouseUp);
//   };
// }

import { Grid } from './grid.js';

export class ResizeHandler {
  private isResizing = false;
  private startX = 0;
  private startWidth = 0;
  private resizingColIndex = -1;

  constructor(private canvas: HTMLCanvasElement, private grid: Grid) {
    this.canvas.addEventListener("mousedown", this.onMouseDown);
  }

  private onMouseDown = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    let cumulativeX = 0;

    for (let col = 0; col < 500; col++) {
      const width = this.grid.getColWidth(col);

      // Check if mouse is within 5px of the right edge of this column
      if (Math.abs(x - (cumulativeX + width)) < 5) {
        this.isResizing = true;
        this.resizingColIndex = col;
        this.startX = x;
        this.startWidth = width;

        document.body.style.cursor = "col-resize";

        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);
        return;
      }

      cumulativeX += width;

      // Stop checking if we've passed the visible area
      if (cumulativeX > this.canvas.width) break;
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isResizing || this.resizingColIndex === -1) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const delta = currentX - this.startX;
    const newWidth = this.startWidth + delta;

    if (newWidth >= 30 && newWidth <= 500) {
      this.grid.setColWidth(this.resizingColIndex, newWidth);
    }
  };

  private onMouseUp = () => {
    this.isResizing = false;
    this.resizingColIndex = -1;
    document.body.style.cursor = "default";
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  };
}
