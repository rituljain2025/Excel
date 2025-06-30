// main.ts (Entry Point for Excel-like Grid App)

import { CellEditor } from './cellEditor.js';
import { Grid } from './grid.js';
import { ResizeHandler } from './resizeHandler.js';
import { RowResizeHandler } from './rowResizeHandler.js';
import { generateSampleData } from './dataGenerator.js';
import { ColumnSelectionHandler } from './ColumnMultiSelectionHandler.js';
import { RowMultiSelection } from './RowMultiSelection.js';
import { UndoManager } from './commands/UndoManager.js';
import { InsertRowCommand } from './commands/InsertRowCommand.js';
import { InsertColumnCommand } from './commands/InsertColumnCommand.js';
import { DeleteRowCommand } from './commands/DeleteRowCommand.js';
import { DeleteColumnCommand } from './commands/DeleteColumnCommand.js';


window.addEventListener("DOMContentLoaded", () => {
  /**
   * Setup canvas with proper device pixel ratio scaling
   */
  const canvas = document.getElementById("excelCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);

  // Initialize grid and supporting classes
  const grid = new Grid(ctx, canvas);
  const undoManager = new UndoManager();

  // Attach behaviors
  new ResizeHandler(canvas, grid, undoManager);
  new RowResizeHandler(canvas, grid, undoManager);
  new CellEditor(canvas, grid, undoManager);
  new ColumnSelectionHandler(canvas, grid);
  new RowMultiSelection(canvas, grid);

  // Load initial data
  const data = generateSampleData();
  grid.loadJsonData(data); // also redraws grid

  /**
   * Attach statistic buttons
   */
  document.getElementById("countBtn")!.addEventListener("click", () => {
    const { count } = grid.computeSelectedCellStats();
    updateStatsDisplay(`Count: ${count}`);
  });

  document.getElementById("minBtn")!.addEventListener("click", () => {
    const { min } = grid.computeSelectedCellStats();
    updateStatsDisplay(`Min: ${min !== null ? min : "N/A"}`);
  });

  document.getElementById("maxBtn")!.addEventListener("click", () => {
    const { max } = grid.computeSelectedCellStats();
    updateStatsDisplay(`Max: ${max !== null ? max : "N/A"}`);
  });

  document.getElementById("sumBtn")!.addEventListener("click", () => {
    const { sum } = grid.computeSelectedCellStats();
    updateStatsDisplay(`Sum: ${sum}`);
  });

  document.getElementById("avgBtn")!.addEventListener("click", () => {
    const { avg } = grid.computeSelectedCellStats();
    updateStatsDisplay(`Average: ${avg !== null ? avg.toFixed(2) : "N/A"}`);
  });

  document.getElementById("loadDataBtn")!.addEventListener("click", () => {
    const data = generateSampleData();
    grid.loadJsonData(data);
  });

  /**
   * Undo/Redo keyboard shortcuts
   */
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") {
      undoManager.undo();
    } else if (e.ctrlKey && e.key === "y") {
      undoManager.redo();
    }
  });

  document.getElementById("redo")!.addEventListener("click", () => {
    undoManager.redo();
  });

  document.getElementById("undo")!.addEventListener("click", () => {
    undoManager.undo();
  });

  /**
   * Displays computed stats in UI
   * @param {string} text - The stat output string
   */
  function updateStatsDisplay(text: string) {
    const statsDisplay = document.getElementById("statsDisplay")!;
    statsDisplay.textContent = text;
  }

  /**
   * Handle insert row button click
   */
  const insertBtn = document.getElementById("insertRowBtn")!;
  insertBtn.addEventListener("click", () => {
    const selectedRow = grid.getSelectedRow();
    if (selectedRow === null || selectedRow < 0) {
      alert("Please select a row first.");
      return;
    }
    const cmd = new InsertRowCommand(grid, selectedRow);
    undoManager.executeCommand(cmd);
  });

  /**
   * Handles row/column header clicks for selection
   */
  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const x = e.clientX - rect.left;
    const container = document.getElementById("container")!;
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    const headerHeight = grid.getRowHeight(0);
    const rowHeaderWidth = grid.getColWidth(0);

    // Row header click
    if (x < rowHeaderWidth && y >= headerHeight) {
      let currentY = 0;
      for (let i = 0; i < grid.totalRows; i++) {
        const rowHeight = grid.getRowHeight(i);
        if (y >= currentY - scrollTop && y <= currentY + rowHeight - scrollTop) {
          grid.setSelectedRow(i);
          grid.redraw();
          break;
        }
        currentY += rowHeight;
      }
    }
    // Column header click
    else if (y < headerHeight && x >= rowHeaderWidth) {
      let currentX = 0;
      for (let j = 0; j < grid.totalCols; j++) {
        const colWidth = grid.getColWidth(j);
        if (x >= currentX - scrollLeft && x <= currentX + colWidth - scrollLeft) {
          grid.setSelectedColumn(j);
          grid.redraw();
          break;
        }
        currentX += colWidth;
      }
    }
  });

  /**
   * Handle insert column button click
   */
  document.getElementById("insertColumnBtn")!.addEventListener("click", () => {
    const selectedCol = grid.getSelectedColumn();
    if (selectedCol === null || selectedCol < 0) {
      alert("Please select a column first.");
      return;
    }
    const cmd = new InsertColumnCommand(grid, selectedCol);
    undoManager.executeCommand(cmd);
  });

  /**
   * Handle delete row button click
   */
  document.getElementById("deleteRowBtn")!.addEventListener("click", () => {
    const selectedRow = grid.getSelectedRow();
    console.log(selectedRow + " inside delete");

    if (selectedRow === null || selectedRow < 0) {
      alert("Please select a row to delete.");
      return;
    }

    const cmd = new DeleteRowCommand(grid, selectedRow);
    undoManager.executeCommand(cmd);
  });

  /**
   * Handle delete column button click
   */
  document.getElementById("deleteColumnBtn")!.addEventListener("click", () => {
    const selectedColumn = grid.getSelectedColumn();
    console.log(selectedColumn + " inside delete");

    if (selectedColumn === null || selectedColumn < 0) {
      alert("Please select a column to delete.");
      return;
    }

    const cmd = new DeleteColumnCommand(grid, selectedColumn);
    undoManager.executeCommand(cmd);
  });

  /**
   * Apply bold formatting to selected cell
   */
  document.getElementById("bold")!.addEventListener("click", () => {
    const cell = grid.getSelectedCell(); // should return { row, col }
    if (!cell) return alert("Select a cell");
    grid.setCellStyle(cell.row, cell.col, { bold: true });
    grid.redraw();
  });

  /**
   * Apply italic formatting to selected cell
   */
  document.getElementById("italic")!.addEventListener("click", () => {
    const cell = grid.getSelectedCell();
    if (!cell) return alert("Select a cell");
    grid.setCellStyle(cell.row, cell.col, { italic: true });
    grid.redraw();
  });
});
