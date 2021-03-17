import InputKey from "./key";

export default class KeySet {
  readonly up: InputKey;
  readonly right: InputKey;
  readonly down: InputKey;
  readonly left: InputKey;
  readonly a: InputKey;
  readonly b: InputKey;

  readonly keyMap: Map<string, InputKey> = new Map<string, InputKey>();

  constructor() {
    this.up = new InputKey();
    this.right = new InputKey();
    this.down = new InputKey();
    this.left = new InputKey();
    this.a = new InputKey();
    this.b = new InputKey();

    this.keyMap.set('ArrowUp', this.up);
    this.keyMap.set('ArrowLeft', this.left);
    this.keyMap.set('ArrowRight', this.right);
    this.keyMap.set('ArrowDown', this.down);
  }
}
