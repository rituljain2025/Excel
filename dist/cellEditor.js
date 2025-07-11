import { EditCellCommand } from "./commands/EditCellCommand.js";
import { FormulaEvaluator } from "./FormulaEvaluator.js";
/**
 * Handles in-place editing of cells in the grid using a double-click event.
 * Integrates with the command pattern via EditCellCommand and UndoManager for undo-redo support.
 */
export class CellEditor {
    /**
     * Creates an instance of CellEditor and attaches a double-click listener on the canvas.
     * @param {HTMLCanvasElement} canvas - The canvas element used for rendering the grid.
     * @param {Grid} grid - The grid instance that holds the cell data and layout.
     * @param {UndoManager} undoManager - Manages command history for undo-redo functionality.
     */
    constructor(canvas, grid, undoManager) {
        this.canvas = canvas;
        this.grid = grid;
        this.undoManager = undoManager;
        /**
         * Handles the double-click event on the canvas to initiate cell editing.
         * Dynamically places an input field over the clicked cell.
         * On blur or Enter key press, updates the grid and registers the command.
         *
         * @param {MouseEvent} e - The mouse event triggered on double-click.
         */
        this.onDoubleClick = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left);
            const y = (e.clientY - rect.top);
            if (x <= this.grid.getColWidth(0) || y <= this.grid.getRowHeight(0))
                return; // Ignore clicks in header area
            const container = document.getElementById("container");
            const scrollTop = container.scrollTop;
            const scrollLeft = container.scrollLeft;
            let col = -1, row = -1;
            let xPos = 0, yPos = 0;
            // Find the clicked column based on x position and scroll offset
            for (let j = 0; j < this.grid.totalCols; j++) {
                const w = this.grid.getColWidth(j);
                if (x >= xPos - scrollLeft && x <= xPos + w - scrollLeft) {
                    col = j;
                    break;
                }
                xPos += w;
            }
            // Find the clicked row based on y position and scroll offset
            for (let i = 0; i < this.grid.totalRows; i++) {
                const h = this.grid.getRowHeight(i);
                if (y >= yPos - scrollTop && y <= yPos + h - scrollTop) {
                    row = i;
                    break;
                }
                yPos += h;
            }
            // If no valid row or column found, exit
            if (col === -1 || row === -1)
                return;
            // Get cell dimensions and position
            const cellX = this.grid.getColumnX(col);
            const cellY = this.grid.getRowY(row);
            const cellW = this.grid.getColWidth(col);
            const cellH = this.grid.getRowHeight(row);
            // Create input element for editing
            const input = document.createElement("input");
            input.type = "text";
            input.value = this.grid.getCellData(row, col) || "";
            input.style.position = "absolute";
            input.style.left = `${(cellX - scrollLeft) + rect.left}px`;
            input.style.top = `${(cellY - scrollTop) + rect.top}px`;
            input.style.width = `${cellW}px`;
            input.style.height = `${cellH}px`;
            input.style.fontSize = "12px";
            input.style.border = "2px solid #137e41";
            input.style.outline = "none";
            input.style.fontFamily = "Arial, sans-serif";
            input.style.padding = "0";
            input.style.margin = "0";
            input.style.zIndex = "1000";
            input.style.boxSizing = "border-box";
            // Attach the input to the DOM and focus it
            document.body.appendChild(input);
            input.focus();
            // --- Formula range highlight logic ---
            let lastHighlightedRange = null;
            const formulaEvaluator = new FormulaEvaluator(() => ""); // dummy getCellData
            function tryHighlightFormulaRange(val) {
                const formula = val.trim();
                // This regex will match formulas like `=sum(d6,d9)`, `=min(a1,a5)`, `=max(b2,b4)`, `=avg(c3,c7)`, etc.
                // `match[1]` will be the function name (e.g., `SUM`, `MIN`, etc.)
                // `match[2]` and `match[3]` will be the two cell references.
                const match = formula.match(/^=\s*([a-zA-Z]+)\(([^,]+),([^\)]+)\)/i);
                if (match) {
                    const funcName = match[1].trim().toUpperCase();
                    const ref1 = match[2].trim().toUpperCase();
                    const ref2 = match[3].trim().toUpperCase();
                    const pos1 = formulaEvaluator["cellLabelToIndex"](ref1);
                    const pos2 = formulaEvaluator["cellLabelToIndex"](ref2);
                    if (pos1.row > 0 && pos1.col > 0 && pos2.row > 0 && pos2.col > 0) {
                        // Compute min/max for range
                        const startRow = Math.min(pos1.row, pos2.row);
                        const endRow = Math.max(pos1.row, pos2.row);
                        const startCol = Math.min(pos1.col, pos2.col);
                        const endCol = Math.max(pos1.col, pos2.col);
                        lastHighlightedRange = { startRow, startCol, endRow, endCol };
                        // Highlight
                        this.grid.setCellRangeSelection(startRow, startCol, endRow, endCol);
                        this.grid.redraw();
                        return;
                    }
                }
                // If not a valid formula, clear highlight
                if (lastHighlightedRange) {
                    this.grid.clearSelection();
                    this.grid.redraw();
                    lastHighlightedRange = null;
                }
            }
            // Bind input event for formula highlighting
            input.addEventListener("input", (event) => {
                tryHighlightFormulaRange.call(this, input.value);
            });
            // Initial check in case cell already has formula
            tryHighlightFormulaRange.call(this, input.value);
            // --- End formula range highlight logic ---
            /**
             * Saves the new value and cleans up the input field.
             * If the value was changed, it creates and executes an EditCellCommand.
             */
            const saveAndCleanup = () => {
                const newValue = input.value;
                const oldValue = this.grid.getCellData(row, col) || "";
                // Remove highlight on blur
                if (lastHighlightedRange) {
                    this.grid.clearSelection();
                    this.grid.redraw();
                    lastHighlightedRange = null;
                }
                if (newValue !== oldValue) {
                    const cmd = new EditCellCommand(this.grid, row, col, oldValue, newValue);
                    this.undoManager.executeCommand(cmd);
                }
                document.body.removeChild(input);
                this.grid.redraw();
            };
            // Save and clean up when the input loses focus
            input.addEventListener("blur", saveAndCleanup);
            // Save and clean up when the Enter key is pressed
            input.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    saveAndCleanup();
                }
            });
        };
        this.canvas.addEventListener("dblclick", this.onDoubleClick);
    }
}
