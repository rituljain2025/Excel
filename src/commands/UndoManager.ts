import { Command } from "./command";

/**
 * Manages undo and redo functionality using the Command pattern.
 * Maintains two stacks: one for undo operations and one for redo.
 */
export class UndoManager {
  /**
   * Stack that holds the history of executed commands for undo.
   * @type {Command[]}
   */
  private undoStack: Command[] = [];

  /**
   * Stack that holds commands that were undone and can be redone.
   * @type {Command[]}
   */
  private redoStack: Command[] = [];

  /**
   * Executes a new command:
   * - Calls the command's execute method.
   * - Pushes it to the undo stack.
   * - Clears the redo stack.
   * 
   * @param {Command} cmd - The command to execute and register.
   */
  executeCommand(cmd: Command): void {
    cmd.execute();
    this.undoStack.push(cmd);
    this.redoStack = [];
  }

  /**
   * Undoes the most recently executed command:
   * - Pops the last command from the undo stack.
   * - Calls its undo method.
   * - Pushes it to the redo stack.
   */
  undo(): void {
    const cmd = this.undoStack.pop();
    if (cmd) {
      cmd.undo();
      this.redoStack.push(cmd);
    }
  }

  /**
   * Redoes the most recently undone command:
   * - Pops the last command from the redo stack.
   * - Calls its execute method.
   * - Pushes it back to the undo stack.
   */
  redo(): void {
    const cmd = this.redoStack.pop();
    if (cmd) {
      cmd.execute();
      this.undoStack.push(cmd);
    }
  }
}
