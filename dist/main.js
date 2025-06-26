// main.js (Entry Point)
import { CellEditor } from './cellEditor.js';
import { Grid } from './grid.js';
import { ResizeHandler } from './resizeHandler.js';
import { RowResizeHandler } from './rowResizeHandler.js';
import { generateSampleData } from './dataGenerator.js';
import { ColumnSelectionHandler } from './ColumnMultiSelectionHandler.js';
import { RowMultiSelection } from './RowMultiSelection.js';
// import { ScrollbarManager } from './ScrollbarManager.js';
window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("excelCanvas");
    const ctx = canvas.getContext("2d");
    const grid = new Grid(ctx, canvas);
    new ResizeHandler(canvas, grid); // Col resize
    new RowResizeHandler(canvas, grid); // Row resize
    new CellEditor(canvas, grid);
    new ColumnSelectionHandler(canvas, grid);
    new RowMultiSelection(canvas, grid);
    const loadButton = document.getElementById("loadDataBtn");
    loadButton.addEventListener("click", () => {
        const data = generateSampleData();
        grid.loadJsonData(data);
    });
    function updateStatsDisplay(text) {
        const statsDisplay = document.getElementById("statsDisplay");
        // statsDisplay.classList.remove("hidden");
        statsDisplay.textContent = text;
    }
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
});
