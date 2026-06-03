export enum EventType {
  InsertChar = 0,
  Backspace = 1,
  ViewportScroll = 2
}

export interface InsertCharPayload {
  type: EventType.InsertChar;
  text: string;
  offset: number;
}

export interface BackspacePayload {
  type: EventType.Backspace;
  offset: number;
  count: number;
}

export interface ViewportScrollPayload {
  type: EventType.ViewportScroll;
  line: number;
  column: number;
}

export type UIEvent = InsertCharPayload | BackspacePayload | ViewportScrollPayload;

export class EditorCore {
  /**
   * Instantiates the core 5080 engine.
   * @param preallocatedCapacity Optional pre-allocated arena capacity.
   */
  constructor(preallocatedCapacity?: number);

  /**
   * Initializes the Piece Tree metadata with an original file contents string.
   */
  init(originalContent: string): void;

  /**
   * Spawns the background worker kernel thread to process incoming events lock-freely.
   */
  start(): boolean;

  /**
   * Stops the background worker kernel thread gracefully.
   */
  stop(): boolean;

  /**
   * Pushes a new low-level user keystroke or action event into the lock-free SPSC Ring Buffer.
   */
  pushEvent(event: UIEvent): boolean;

  /**
   * Restructures and returns the complete reconstructed text document.
   */
  getText(): string;

  /**
   * Returns the current overall logical character length of the active document.
   */
  totalLogicalLength(): number;
}
