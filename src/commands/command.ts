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
