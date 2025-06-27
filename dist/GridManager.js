import { Grid } from './grid.js';
import { InsertRow } from './InsertRow';
import { InsertColumn } from './InsertColumn';
// Example of how to integrate the insert functionality with your Grid
export class GridManager {
    constructor(canvas) {
        const ctx = canvas.getContext('2d');
        this.grid = new Grid(ctx, canvas);
        this.insertRow = new InsertRow(this.grid);
        this.insertColumn = new InsertColumn(this.grid);
        this.setupEventListeners();
    }
    setupEventListeners() {
        // Create insert row button
        const insertRowBtn = document.getElementById('insert-row-btn');
        if (insertRowBtn) {
            insertRowBtn.addEventListener('click', () => {
                this.handleInsertRow();
            });
        }
        // Create insert column button
        const insertColBtn = document.getElementById('insert-column-btn');
        if (insertColBtn) {
            insertColBtn.addEventListener('click', () => {
                this.handleInsertColumn();
            });
        }
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.handleInsertRow();
                        break;
                    case 'c':
                        e.preventDefault();
                        this.handleInsertColumn();
                        break;
                }
            }
        });
    }
    handleInsertRow() {
        const selectedRange = this.grid.getSelectedRange();
        if (selectedRange) {
            // Insert row before the first selected row
            this.insertRow.insertRowBefore(selectedRange.startRow);
        }
        else {
            // Check if a row is selected (you'll need to add getter methods to Grid)
            // For now, insert at row 2 as default
            this.insertRow.insertRowBefore(2);
        }
    }
    handleInsertColumn() {
        const selectedRange = this.grid.getSelectedRange();
        if (selectedRange) {
            // Insert column before the first selected column
            this.insertColumn.insertColumnBefore(selectedRange.startCol);
        }
        else {
            // Check if a column is selected (you'll need to add getter methods to Grid)
            // For now, insert at column 2 as default
            this.insertColumn.insertColumnBefore(2);
        }
    }
    // Public methods to expose functionality
    insertRowAt(rowIndex) {
        this.insertRow.insertRowBefore(rowIndex);
    }
    insertColumnAt(colIndex) {
        this.insertColumn.insertColumnBefore(colIndex);
    }
    insertMultipleRowsAt(rowIndex, count) {
        this.insertRow.insertMultipleRows(rowIndex, count);
    }
    insertMultipleColumnsAt(colIndex, count) {
        this.insertColumn.insertMultipleColumns(colIndex, count);
    }
    deleteRowAt(rowIndex) {
        this.insertRow.deleteRow(rowIndex);
    }
    deleteColumnAt(colIndex) {
        this.insertColumn.deleteColumn(colIndex);
    }
    getGrid() {
        return this.grid;
    }
}
// Usage example:
/*
// HTML setup
<button id="insert-row-btn">Insert Row</button>
<button id="insert-column-btn">Insert Column</button>
<div id="container">
  <canvas id="grid-canvas"></canvas>
  <div id="spacer"></div>
</div>

// JavaScript/TypeScript usage
const canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
const gridManager = new GridManager(canvas);

// Programmatic usage
gridManager.insertRowAt(5);  // Insert row before row 5
gridManager.insertColumnAt(3);  // Insert column before column 3
gridManager.insertMultipleRowsAt(10, 3);  // Insert 3 rows before row 10
*/ 
