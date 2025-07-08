/**
 * MultiCommand allows batching multiple commands as a single undo/redo unit.
 */
export class MultiCommand {
    constructor(commands) {
        this.commands = commands;
    }
    execute() {
        for (const cmd of this.commands) {
            cmd.execute();
        }
    }
    undo() {
        // Undo in reverse order
        for (let i = this.commands.length - 1; i >= 0; i--) {
            this.commands[i].undo();
        }
    }
}
