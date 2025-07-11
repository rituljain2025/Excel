export interface EventHandler{
   hitTest(x:number,y :number):boolean;
   onMouseDown(e:MouseEvent):void;
   onMouseMove(e:MouseEvent):void;
   onMouseUp(e:MouseEvent):void;
   getCursor(x:number,y:number):string;
}