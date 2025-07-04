export class Column {
    constructor(index, width = 80) {
        this.width = 80;
        this.index = index;
        this.width = width;
    }
    getIndex() {
        return this.index;
    }
    setIndex(index) {
        this.index = index;
    }
    getWidth() {
        return this.width;
    }
    setWidth(width) {
        if (width >= 30 && width <= 500) {
            this.width = width;
        }
    }
    getLabel() {
        let label = '';
        let colIndex = this.index;
        while (colIndex >= 0) {
            label = String.fromCharCode((colIndex % 26) + 65) + label;
            colIndex = Math.floor(colIndex / 26) - 1;
        }
        return label;
    }
    getX(columns) {
        let x = 0;
        for (let i = 0; i < this.index; i++) {
            if (columns[i]) {
                x += columns[i].getWidth();
            }
        }
        return x;
    }
    clone() {
        return new Column(this.index, this.width);
    }
    static getColumnFromX(x, columns) {
        let currentX = 0;
        for (let col = 0; col < columns.length; col++) {
            if (columns[col]) {
                currentX += columns[col].getWidth();
                if (x < currentX)
                    return col;
            }
        }
        return -1;
    }
    static calculateTotalWidth(columns, count) {
        let totalWidth = 0;
        for (let i = 0; i < count; i++) {
            totalWidth += columns[i]?.getWidth() || 80;
        }
        return totalWidth;
    }
}
