// FormulaEvaluator.ts
/**
 * Evaluates spreadsheet-like formulas such as SUM(A1:A5), AVG(B2,B4), etc.
 * Supports basic math functions over cell references.
 */
export class FormulaEvaluator {
    /**
     * @param getCellData - A callback to retrieve the value of a specific cell by row and column.
     */
    constructor(getCellData) {
        this.getCellData = getCellData;
    }
    /**
     * Evaluates a formula string like "SUM(A1:A5)" or "AVG(B2,B5)".
     * @param {string} formula - The raw formula string input.
     * @returns {string} - The result of the evaluated formula or "INVALID".
     */
    evaluate(formula) {
        const cleaned = formula.trim().toUpperCase();
        console.log(cleaned);
        if (cleaned.startsWith("SUM(")) {
            return this.handleFunction(cleaned, "SUM");
        }
        else if (cleaned.startsWith("AVG(")) {
            return this.handleFunction(cleaned, "AVG");
        }
        else if (cleaned.startsWith("MAX(")) {
            return this.handleFunction(cleaned, "MAX");
        }
        else if (cleaned.startsWith("MIN(")) {
            return this.handleFunction(cleaned, "MIN");
        }
        return "INVALID";
    }
    /**
     * Handles supported functions (SUM, AVG, MAX, MIN) by extracting referenced cells and computing the result.
     * @param {string} formula - The full formula string.
     * @param {string} func - The function name (e.g., SUM, AVG).
     * @returns {string} - Computed result as string.
     */
    handleFunction(formula, func) {
        const inside = formula.slice(func.length + 1, -1); // Remove FUNC( and )
        const refs = inside.split(",").map(s => s.trim());
        const values = [];
        // Handle special case: two cells that form a range in same row or column
        if (refs.length === 2) {
            const pos1 = this.cellLabelToIndex(refs[0]);
            const pos2 = this.cellLabelToIndex(refs[1]);
            // If in same row or column, expand into a range
            if (pos1.col === pos2.col || pos1.row === pos2.row) {
                const rangeRef = refs[0] + ":" + refs[1];
                const rangeCells = this.expandRange(rangeRef);
                for (const cell of rangeCells) {
                    const { row, col } = this.cellLabelToIndex(cell);
                    console.log(row + " and " + col);
                    const val = this.getCellData(row, col);
                    console.log(val + " check");
                    const num = parseFloat(val || "");
                    if (!isNaN(num)) {
                        values.push(num);
                    }
                }
            }
            else {
                // If not in same row/col, treat both as individual cells
                for (const ref of refs) {
                    const { row, col } = this.cellLabelToIndex(ref);
                    console.log(row + " and " + col);
                    const val = this.getCellData(row, col);
                    console.log(val + " check");
                    const num = parseFloat(val || "");
                    if (!isNaN(num)) {
                        values.push(num);
                    }
                }
            }
        }
        else {
            // Handle multiple references or single cell/range
            for (const ref of refs) {
                if (ref.includes(":")) {
                    const rangeCells = this.expandRange(ref);
                    for (const cell of rangeCells) {
                        const { row, col } = this.cellLabelToIndex(cell);
                        console.log(row + " and " + col);
                        const val = this.getCellData(row, col);
                        console.log(val + " check");
                        const num = parseFloat(val || "");
                        if (!isNaN(num)) {
                            values.push(num);
                        }
                    }
                }
                else {
                    const { row, col } = this.cellLabelToIndex(ref);
                    console.log(row + " and " + col);
                    const val = this.getCellData(row, col);
                    console.log(val + " check");
                    const num = parseFloat(val || "");
                    if (!isNaN(num)) {
                        values.push(num);
                    }
                }
            }
        }
        console.log(values);
        if (values.length === 0)
            return "0";
        switch (func) {
            case "SUM": return values.reduce((a, b) => a + b, 0).toString();
            case "AVG": return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
            case "MAX": return Math.max(...values).toString();
            case "MIN": return Math.min(...values).toString();
            default: return "ERR";
        }
    }
    /**
     * Expands a range string like "B2:D4" into individual cell labels.
     * @param {string} range - A range string using colon notation.
     * @returns {string[]} - List of cell labels included in the range.
     */
    expandRange(range) {
        const [startCell, endCell] = range.split(":");
        const startPos = this.cellLabelToIndex(startCell);
        const endPos = this.cellLabelToIndex(endCell);
        const cells = [];
        for (let row = Math.min(startPos.row, endPos.row); row <= Math.max(startPos.row, endPos.row); row++) {
            for (let col = Math.min(startPos.col, endPos.col); col <= Math.max(startPos.col, endPos.col); col++) {
                cells.push(this.indexToCellLabel(row, col));
            }
        }
        return cells;
    }
    /**
     * Converts a (row, col) index to a cell label like "A1" or "AB23".
     * @param {number} row - The row number.
     * @param {number} col - The column number.
     * @returns {string} - The corresponding cell label.
     */
    indexToCellLabel(row, col) {
        let columnLabel = "";
        let tempCol = col;
        while (tempCol > 0) {
            tempCol--;
            columnLabel = String.fromCharCode(65 + (tempCol % 26)) + columnLabel;
            tempCol = Math.floor(tempCol / 26);
        }
        return columnLabel + row;
    }
    /**
     * Converts a cell label like "C5" into row and column indexes.
     * @param {string} label - The cell label.
     * @returns {{ row: number, col: number }} - The corresponding row and column indexes.
     */
    cellLabelToIndex(label) {
        const match = label.match(/^([A-Z]+)(\d+)$/);
        if (!match)
            return { row: -1, col: -1 };
        const [, letters, number] = match;
        let col = 0;
        for (let i = 0; i < letters.length; i++) {
            col *= 26;
            col += letters.charCodeAt(i) - 65 + 1;
        }
        return {
            row: parseInt(number, 10),
            col: col
        };
    }
}
