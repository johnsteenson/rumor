

export default class Position2D {

  public x: number;
  public y: number;
  public floatX: number;
  public floatY: number;

  public velX: number;
  public velY: number;
  public destX: number;
  public destY: number;

  public onDone?: Function;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
    this.floatX = x;
    this.floatY = y;
    this.velX = 0;
    this.velY = 0;
    this.destX = x;
    this.destY = y;
  }

  public moveBy(x: number, y: number, timeMs: number) {
    this.destX = this.x + x;
    this.destY = this.y + y;

    this.velX = (this.destX - this.x) / timeMs;
    this.velY = (this.destY - this.y) / timeMs;
  }

  public update(deltaTime: DOMHighResTimeStamp) {
    if (this.velX !== 0) {
      const vel = this.velX * deltaTime;
      this.floatX = this.floatX + vel;
      this.x = Math.floor(this.floatX);
      console.log('Test', deltaTime, this.velX, vel)
      // console.log('Dist', this.floatX, vel, Math.abs(this.floatX - this.destX) - Math.abs(vel))
      if (Math.abs(this.floatX - this.destX) - Math.abs(vel) < 0) {
        this.velX = 0;
        this.floatX = this.destX;
      }
    }
  }

}