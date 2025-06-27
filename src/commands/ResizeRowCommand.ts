import { Grid } from "../grid.js";
import { Command } from "./command.js";
export class ResizeRowCommand implements Command{
  
    constructor(
        private grid:Grid, 
        private oldHeigt:number,
        private newHeight:number,
       
        private rowIndex:number
    ){}

    execute(): void {
        this.grid.setRowHeight(this.rowIndex,this.newHeight);
        this.grid.redraw();
    }
    undo(): void {
        this.grid.setRowHeight(this.rowIndex,this.oldHeigt);
        this.grid.redraw();
    }
}