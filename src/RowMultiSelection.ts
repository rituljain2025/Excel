import { Grid } from "./grid";
export class RowMultiSelection{
    private isDragging = false;
    private dragStartRow = -1;
    private dragEndRow = -1;
    constructor(private canvas:HTMLCanvasElement,private grid:Grid){
       this.canvas.addEventListener("mousedown",this.onMouseDown);
       this.canvas.addEventListener("mousemove",this.onMouseMove);
       this.canvas.addEventListener("mouseup",this.onMouseUp);
    }
    public onMouseDown = (e:MouseEvent)=>{
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const container = document.getElementById("container")!;
        const scrollTop = container?.scrollTop;
        const headerWidth = this.grid.getColWidth(0);
        const headerHeight = this.grid.getRowHeight(0);
        
        if(x < headerWidth && y >= headerHeight){
            const adjustedY = y + scrollTop;
            const row = this.grid.getRowFromY(adjustedY);
            if(row > 0){
                this.isDragging = true;
                this.dragStartRow = this.dragEndRow = row;
                this.grid.clearSelection();
                this.grid.setRowRangeSelection(this.dragStartRow,this.dragEndRow);
                this.grid.redraw();
            }
        }
        
    }
    public onMouseMove = (e:MouseEvent) =>{
        if(!this.isDragging) return;

        const rect = this.canvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const container = document.getElementById("container")!;
        const scrollTop = container.scrollTop;
        const adjustedY = y + scrollTop;

        const row = this.grid.getRowFromY(adjustedY);
        if(row > 0){
            this.dragEndRow = row;
            const start = Math.min(this.dragStartRow,this.dragEndRow);
            const end = Math.max(this.dragStartRow,this.dragEndRow);
            this.grid.setRowRangeSelection(this.dragStartRow,this.dragEndRow);
            this.grid.redraw();
        }
    }
    public onMouseUp = (e:MouseEvent) =>{
        if(this.isDragging){
            this.isDragging = false;
            this.grid.suppressNextHeaderClick();
        }
    }
}