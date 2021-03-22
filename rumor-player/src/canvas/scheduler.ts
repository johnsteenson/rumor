type RenderTask = {
  priority: number,
  call: (deltaMs: number) => void
};

export default class RenderScheduler {
  private static instance: RenderScheduler;

  private tasks: RenderTask[] = [];

  private doRenderFrame: FrameRequestCallback;

  private lastTimestamp: DOMHighResTimeStamp;

  public static getInstance(): RenderScheduler {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new RenderScheduler();
    return this.instance;
  }

  constructor() {
    this.doRenderFrame = this.renderFrame.bind(this);
  }

  private renderFrame(timestamp: DOMHighResTimeStamp) {
    const delta = timestamp - this.lastTimestamp;

    for (let task of this.tasks) {
      task.call(delta);
    }

    this.lastTimestamp = timestamp;

    window.requestAnimationFrame(this.doRenderFrame);
  }

  public start() {
    this.lastTimestamp = performance.now();
    window.requestAnimationFrame(this.doRenderFrame);
  }

  public addTask(taskCall: (deltaMs: number) => void, priority: number) {
    this.tasks.push({
      priority,
      call: taskCall
    });

    this.tasks.sort((a, b) => (a.priority - b.priority));
  }

  public removeTask(task: (deltaMs: number) => void): boolean {
    const index = this.tasks.findIndex((curTask) => (curTask.call == task));
    if (index === -1) {
      return false;
    }

    this.tasks.splice(index, 1);
  }
}
