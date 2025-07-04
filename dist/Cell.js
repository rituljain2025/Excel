export class Cell {
    constructor(data, style) {
        this.style = {};
        this.data = data;
        this.style = style || {};
    }
    setValue(value) {
        this.data = value;
    }
    getValue() {
        return this.data;
    }
    setStyle(style) {
        this.style = { ...this.style, ...style };
    }
    getStyle() {
        return this.style;
    }
    hasValue() {
        return this.data !== undefined && this.data !== '';
    }
    isFormula() {
        return this.data?.startsWith('=') || false;
    }
    getDisplayValue(formulaEvaluator) {
        if (!this.data)
            return '';
        if (this.isFormula()) {
            return formulaEvaluator.evaluate(this.data.substring(1));
        }
        return this.data;
    }
    isNumeric() {
        return this.data !== undefined && !isNaN(Number(this.data));
    }
    getNumericValue() {
        if (this.isNumeric()) {
            return Number(this.data);
        }
        return null;
    }
    clone() {
        return new Cell(this.data, { ...this.style });
    }
}
