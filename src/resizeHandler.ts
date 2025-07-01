import { UndoManager } from './commands/UndoManager.js';
import { Grid } from './grid.js';
import { ResizeColumnCommand } from './commands/ResizeColumnCommand.js';
import { SelectionManager } from './SelectionManager.js';

/**
 * Handles resizing of columns in the grid when the user drags near column edges.
 */
export class ResizeHandler {
  /** Whether a resize operation is in progress */
  private isResizing = false;
  /** X-coordinate where resize started */
  private startX = 0;
  /** Original width of the column before resizing */
  private startWidth = 0;
  /** Index of the column being resized */
  private resizingColIndex = -1;
  /** Whether mouse is hovering near a resizable border */
  private isHovering = false;
  /** Final width during active resize drag (used for undo command) */
  private currentNewWidth: number = 0;

  /**
   * @param canvas HTML canvas where the grid is drawn
   * @param grid Grid instance to manipulate column widths
   * @param undoManager UndoManager to support undo/redo functionality
   */
  constructor(private canvas: HTMLCanvasElement, private grid: Grid, private undoManager: UndoManager,private selectionManager : SelectionManager) {
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mouseleave", this.onMouseLeave);
  }

  /**
   * Checks if the y-position is within the column header area
   */
  private isInColumnHeader(y: number): boolean {
    const headerHeight = this.grid.getRowHeight(0);
    return y >= 0 && y <= headerHeight;
  }

  /**
   * Handles mouse down event to initiate resizing if user clicks near column edge
   */
  private onMouseDown = (e: MouseEvent) => {
   
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
   
    if (!this.isInColumnHeader(y)) return;

    const container = document.getElementById("container")!;
    const scrollLeft = container.scrollLeft;
    let cumulativeX = -scrollLeft;

    for (let col = 0; col < 500; col++) {
      const width = this.grid.getColWidth(col);

      if (Math.abs(x - (cumulativeX + width)) < 5) {
        this.selectionManager.suppressNextHeaderClick(); 
        this.isResizing = true;

        this.resizingColIndex = col;
        this.startX = x;
        this.startWidth = width;
        this.canvas.style.cursor = "col-resize";

        window.addEventListener("mousemove", this.onMouseMoveResize);
        window.addEventListener("mouseup", this.onMouseUp);
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      cumulativeX += width;
      if (cumulativeX > this.canvas.clientWidth + scrollLeft) break;
    }
  };

  /**
   * Handles active resizing as user drags the mouse
   */
  private onMouseMoveResize = (e: MouseEvent) => {
    if (!this.isResizing || this.resizingColIndex === -1) return;

    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const delta = currentX - this.startX;
    const newWidth = this.startWidth + delta;


    if (newWidth >= 30 && newWidth <= 500) {
      this.grid.setColWidth(this.resizingColIndex, newWidth);
      this.currentNewWidth = newWidth;
    }
  };

  /**
   * Ends the resize operation and registers undo command
   */
  private onMouseUp = () => {
    if (this.isResizing) {
     
      const colIndex = this.resizingColIndex;
      const oldWidth = this.startWidth;
      const newWidth = this.currentNewWidth;
    
      this.isResizing = false;
      this.resizingColIndex = -1;
      this.currentNewWidth = 0;

      if (oldWidth !== newWidth && newWidth >= 30 && newWidth <= 500) {
        this.grid.setColWidth(colIndex, oldWidth); // reset for undo consistency

        const cmd = new ResizeColumnCommand(this.grid, colIndex, newWidth);
        this.undoManager.executeCommand(cmd);
      }
   
      this.canvas.style.cursor = "default";
      document.body.style.cursor = "default";
      this.isHovering = false;

      window.removeEventListener("mousemove", this.onMouseMoveResize);
      window.removeEventListener("mouseup", this.onMouseUp);
      this.selectionManager.suppressNextHeaderClick();
    }
  };

  /**
   * Handles normal mouse movement to show resize cursor near column edges
   */
  private onMouseMove = (e: MouseEvent) => {
    if (this.isResizing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!this.isInColumnHeader(y)) {
      if (this.isHovering) {
        this.canvas.style.cursor = "default";
        this.isHovering = false;
      }
      return;
    }

    const container = document.getElementById("container")!;
    const scrollLeft = container.scrollLeft;
    let cumulativeX = -scrollLeft;
    let foundResizeBorder = false;

    for (let col = 0; col < 500; col++) {
      const width = this.grid.getColWidth(col);

      if (Math.abs(x - (cumulativeX + width)) < 5) {
       
        this.canvas.style.cursor = "col-resize";
        this.isHovering = true;
        foundResizeBorder = true;
        break;
      }

      cumulativeX += width;
      if (cumulativeX > this.canvas.clientWidth + scrollLeft) break;
    }

    if (!foundResizeBorder && this.isHovering) {
      this.canvas.style.cursor = "default";
      this.isHovering = false;
    }
  };

  /**
   * Resets the cursor when the mouse leaves the canvas
   */
  private onMouseLeave = () => {
    if (!this.isResizing && this.isHovering) {
      this.canvas.style.cursor = "default";
      this.isHovering = false;
    }
  };

  /**
   * Cleans up all event listeners and state
   */
  public destroy() {
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mouseleave", this.onMouseLeave);

    if (this.isResizing) {
      window.removeEventListener("mousemove", this.onMouseMoveResize);
      window.removeEventListener("mouseup", this.onMouseUp);
      this.canvas.style.cursor = "default";
      document.body.style.cursor = "default";
    }
  }
}
