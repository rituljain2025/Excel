// main.js (Entry Point)
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
    const canvas = document.getElementById("excelCanvas");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    const grid = new Grid(ctx, canvas);
    const undoManager = new UndoManager();
    new ResizeHandler(canvas, grid, undoManager);
    new RowResizeHandler(canvas, grid, undoManager);
    new CellEditor(canvas, grid, undoManager);
    new ColumnSelectionHandler(canvas, grid);
    new RowMultiSelection(canvas, grid);
    // Load sample data immediately
    const data = generateSampleData();
    grid.loadJsonData(data); // this should also call this.redraw()
    // Hook up buttons
    document.getElementById("countBtn").addEventListener("click", () => {
        const { count } = grid.computeSelectedCellStats();
        updateStatsDisplay(`Count: ${count}`);
    });
    document.getElementById("minBtn").addEventListener("click", () => {
        const { min } = grid.computeSelectedCellStats();
        updateStatsDisplay(`Min: ${min !== null ? min : "N/A"}`);
    });
    document.getElementById("maxBtn").addEventListener("click", () => {
        const { max } = grid.computeSelectedCellStats();
        updateStatsDisplay(`Max: ${max !== null ? max : "N/A"}`);
    });
    document.getElementById("sumBtn").addEventListener("click", () => {
        const { sum } = grid.computeSelectedCellStats();
        updateStatsDisplay(`Sum: ${sum}`);
    });
    document.getElementById("avgBtn").addEventListener("click", () => {
        const { avg } = grid.computeSelectedCellStats();
        updateStatsDisplay(`Average: ${avg !== null ? avg.toFixed(2) : "N/A"}`);
    });
    document.getElementById("loadDataBtn").addEventListener("click", () => {
        const data = generateSampleData();
        grid.loadJsonData(data);
    });
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "z") {
            undoManager.undo();
        }
        else if (e.ctrlKey && e.key === "y") {
            undoManager.redo();
        }
    });
    document.getElementById("redo").addEventListener("click", () => {
        undoManager.redo();
    });
    document.getElementById("undo").addEventListener("click", () => {
        undoManager.undo();
    });
    function updateStatsDisplay(text) {
        const statsDisplay = document.getElementById("statsDisplay");
        statsDisplay.textContent = text;
    }
    const insertBtn = document.getElementById("insertRowBtn");
    insertBtn.addEventListener("click", () => {
        const selectedRow = grid.getSelectedRow();
        if (selectedRow === null || selectedRow < 0) {
            alert("Please select a row first.");
            return;
        }
        const cmd = new InsertRowCommand(grid, selectedRow);
        undoManager.executeCommand(cmd);
    });
    canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const x = e.clientX - rect.left;
        const container = document.getElementById("container");
        const scrollTop = container.scrollTop;
        const scrollLeft = container.scrollLeft;
        const headerHeight = grid.getRowHeight(0);
        const rowHeaderWidth = grid.getColWidth(0);
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
    document.getElementById("insertColumnBtn").addEventListener("click", () => {
        const selectedCol = grid.getSelectedColumn();
        if (selectedCol === null || selectedCol < 0) {
            alert("Please select a column first.");
            return;
        }
        const cmd = new InsertColumnCommand(grid, selectedCol);
        undoManager.executeCommand(cmd);
    });
    document.getElementById("deleteRowBtn").addEventListener("click", () => {
        const selectedRow = grid.getSelectedRow();
        console.log(selectedRow + "insise dekete");
        if (selectedRow === null || selectedRow < 0) {
            alert("Please select a row to delete.");
            return;
        }
        const cmd = new DeleteRowCommand(grid, selectedRow);
        undoManager.executeCommand(cmd);
    });
    document.getElementById("deleteColumnBtn").addEventListener("click", () => {
        const selectedColumn = grid.getSelectedColumn();
        console.log(selectedColumn + "insise dekete");
        if (selectedColumn === null || selectedColumn < 0) {
            alert("Please select a row to delete.");
            return;
        }
        const cmd = new DeleteColumnCommand(grid, selectedColumn);
        undoManager.executeCommand(cmd);
    });
    document.getElementById("bold").addEventListener("click", () => {
        const cell = grid.getSelectedCell(); // implement this if not present
        if (!cell)
            return alert("Select a cell");
        grid.setCellStyle(cell.row, cell.col, { bold: true });
        grid.redraw();
    });
    document.getElementById("italic").addEventListener("click", () => {
        const cell = grid.getSelectedCell(); // implement this if not present
        if (!cell)
            return alert("Select a cell");
        grid.setCellStyle(cell.row, cell.col, { italic: true });
        grid.redraw();
    });
});
