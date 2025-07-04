import { Cell } from "./Cell.js";
export class Row {
    constructor(index, height = 25) {
        this.cells = new Map();
        this.height = 25;
        this.index = index;
        this.height = height;
    }
    getIndex() {
        return this.index;
    }
    setIndex(index) {
        this.index = index;
    }
    getHeight() {
        return this.height;
    }
    setHeight(height) {
        if (height >= 20 && height <= 200) {
            this.height = height;
        }
    }
    setCell(colIndex, value) {
        if (!this.cells.has(colIndex)) {
            this.cells.set(colIndex, new Cell());
        }
        this.cells.get(colIndex).setValue(value);
    }
    getCell(colIndex) {
        return this.cells.get(colIndex);
    }
    getCellValue(colIndex) {
        return this.cells.get(colIndex)?.getValue();
    }
    setCellStyle(colIndex, style) {
        if (!this.cells.has(colIndex)) {
            this.cells.set(colIndex, new Cell());
        }
        this.cells.get(colIndex).setStyle(style);
    }
    getCellStyle(colIndex) {
        return this.cells.get(colIndex)?.getStyle();
    }
    getAllCells() {
        return this.cells;
    }
    insertCellAt(colIndex) {
        const newCells = new Map();
        for (const [col, cell] of this.cells.entries()) {
            const newCol = col >= colIndex ? col + 1 : col;
            newCells.set(newCol, cell);
        }
        this.cells = newCells;
    }
    removeCellAt(colIndex) {
        const newCells = new Map();
        for (const [col, cell] of this.cells.entries()) {
            if (col === colIndex)
                continue;
            const newCol = col > colIndex ? col - 1 : col;
            newCells.set(newCol, cell);
        }
        this.cells = newCells;
    }
    clone() {
        const newRow = new Row(this.index, this.height);
        for (const [col, cell] of this.cells.entries()) {
            newRow.cells.set(col, cell.clone());
        }
        return newRow;
    }
    getNumericValues() {
        const values = [];
        for (const cell of this.cells.values()) {
            const numValue = cell.getNumericValue();
            if (numValue !== null) {
                values.push(numValue);
            }
        }
        return values;
    }
    hasData() {
        for (const cell of this.cells.values()) {
            if (cell.hasValue()) {
                return true;
            }
        }
        return false;
    }
}
