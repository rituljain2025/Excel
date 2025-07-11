// HandlerManager.ts
/**
 * Manages delegation of mouse events to appropriate event handlers based on hit testing.
 * This class centralizes mouse interactions such as resize, selection, and drag operations
 * by delegating them to matching handlers that implement the EventHandler interface.
 */
export class HandlerManager {
    /**
     * Initializes the HandlerManager.
     * @param {HTMLCanvasElement} canvas - The canvas on which mouse events occur.
     * @param {Grid} grid - Reference to the grid for context in handlers.
     * @param {EventHandler[]} handlers - List of all possible handlers.
     */
    constructor(canvas, grid, handlers) {
        this.canvas = canvas;
        this.grid = grid;
        /** Currently active event handler */
        this.currentHandler = null;
        /**
         * Handles the `mousedown` event and sets the appropriate handler based on cursor position.
         * @param {MouseEvent} e - The mouse event object.
         */
        this.onMouseDown = (e) => {
            this.currentHandler = this.determineHandlerType(e);
            if (this.currentHandler) {
                this.currentHandler.onMouseDown(e);
            }
        };
        /**
         * Determines the cursor style to display based on the handler under the pointer.
         * @param {MouseEvent} e - The mouse event object.
         * @returns {string} The CSS cursor style.
         */
        this.getCursor = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const handler = this.determineHandlerType(e);
            return handler.getCursor(x, y);
        };
        /**
         * Updates the canvas cursor style by checking which handler is under the pointer.
         * @param {MouseEvent} e - The mouse event object.
         */
        this.updateCursor = (e) => {
            const cursor = this.getCursor(e);
            this.canvas.style.cursor = cursor;
        };
        /**
         * Handles the `mousemove` event and delegates it to the current active handler.
         * Also updates cursor if no handler is currently active.
         * @param {MouseEvent} e - The mouse event object.
         */
        this.onMouseMove = (e) => {
            if (!this.currentHandler) {
                this.updateCursor(e);
            }
            if (this.currentHandler) {
                this.currentHandler.onMouseMove(e);
            }
        };
        /**
         * Handles the `mouseup` event and notifies the current active handler.
         * @param {MouseEvent} e - The mouse event object.
         */
        this.onMouseUp = (e) => {
            if (this.currentHandler) {
                this.currentHandler.onMouseUp(e);
            }
        };
        this.handlers = handlers;
        this.attach();
    }
    /**
     * Attaches mouse event listeners to the canvas.
     */
    attach() {
        this.canvas.addEventListener("mousedown", this.onMouseDown);
        this.canvas.addEventListener("mousemove", this.onMouseMove);
        this.canvas.addEventListener("mouseup", this.onMouseUp);
    }
    /**
     * Determines which event handler should be active based on the pointer coordinates.
     * Performs hit testing with all handlers.
     * @param {MouseEvent} e - The mouse event object.
     * @returns {EventHandler | null} - The handler under the pointer, or null if none.
     */
    determineHandlerType(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (const handler of this.handlers) {
            if (handler && handler.hitTest(x, y)) {
                return handler;
            }
        }
        return null;
    }
}
