/**
 * The Command interface defines the structure for implementing
 * the Command design pattern. It provides a standard contract
 * for any action that can be executed and undone.
 */
export interface Command {
  /**
   * Executes the command action.
   * This method applies the changes or performs the action associated with the command.
   */
  execute(): void;

  /**
   * Reverts the command action.
   * This method undoes the effect of the previously executed command.
   */
  undo(): void;
}

/**
 * MultiCommand allows batching multiple commands as a single undo/redo unit.
 */
export class MultiCommand implements Command {
  private commands: Command[];
  constructor(commands: Command[]) {
    this.commands = commands;
  }
  execute(): void {
    for (const cmd of this.commands) {
      cmd.execute();
    }
  }
  undo(): void {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}
