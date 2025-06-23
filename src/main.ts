// main.js (Entry Point)
import { CellEditor } from './cellEditor.js';
import { Grid } from './grid.js';
import { ResizeHandler } from './resizeHandler.js';
import { RowResizeHandler } from './rowResizeHandler.js';
import { generateSampleData } from './dataGenerator.js';

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("excelCanvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const grid = new Grid(ctx, canvas);

  const data = generateSampleData();
  grid.loadJsonData(data);

  // const employeeData =  DataGenerator.generateEmployeeData(1000);
  // console.log("delay");
  
  // grid.loadJsonData(employeeData);
  new ResizeHandler(canvas, grid);
  new RowResizeHandler(canvas, grid);  // Row resize
  new CellEditor(canvas,grid);

 
});
