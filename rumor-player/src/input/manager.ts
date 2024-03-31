import KeySet from './keyset';

class InputManager {
  // private static instance: InputManager;

  readonly keys: KeySet = new KeySet();

  // public static getInstance() {
  //   if (this.instance) {
  //     return this.instance;
  //   }
  //   this.instance = new InputManager();
  //   return this.instance;
  // }

  constructor() {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
      const key = event.key;
      const handler = this.keys.keyMap.get(key);

      if (handler && handler.callback && handler.keyDown()) {
        handler.callback(event);
      }
    });
  }
}

export default new InputManager();