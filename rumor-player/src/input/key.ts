export type KeyHandler = (event: KeyboardEvent) => void;

export default class InputKey {

  private _locked = false;

  private _delay = 0;

  private _pressed = false;

  private _callback: KeyHandler;

  private lastPressed: DOMHighResTimeStamp;

  constructor(delay = 0) {
    this._delay = 0;
  }

  public set locked(locked: boolean) {
    this._locked = locked;
  }

  public get locked() {
    return this._locked;
  }

  public set delay(delay: number) {
    this.delay = delay;
  }

  public get delay() {
    return this._delay;
  }

  public keyDown(): boolean {
    if (this._locked) {
      return false;
    }

    const timestamp = performance.now();
    if (this.lastPressed) {
      const diff = timestamp - this.lastPressed;
      if (diff < this._delay) {
        return false;
      }
    }

    this.lastPressed = timestamp;
    this._pressed = true;

    return true;
  }

  public keyUp() {
    this._pressed = false;
  }

  public get pressed() {
    return this._pressed;
  }

  public set callback(callback: KeyHandler) {
    this._callback = callback;
  }

  public get callback(): KeyHandler {
    return this._callback;
  }
}