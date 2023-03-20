<template>
  <div class="canvas-container">
    <slot></slot>
    <canvas ref="vCanvasRef" @pointerdown="clickVertical" class="vbar" width="16" height="16"
      v-if="!hideVScroll"></canvas>
    <canvas ref="hCanvasRef" @pointerdown="clickHorizontal" class="hbar" width="16" height="16"
      v-if="!hideHScroll"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { clampBetween } from "@/lib/utils";
import { ScrollRect, Dimension, Point, Axis } from "@rumor/common";

import {
  getLeftArrow,
  getRightArrow,
  getUpArrow,
  getDownArrow,
  getMouseCoor
} from "@/canvas/utils";
import { nextTick, onMounted, Ref, ref, watch } from "vue";
import { PropType } from "vue";

const SCROLLBAR_WIDTH = 16;
const SCROLLBAR_OFFSET = 8;

const vCanvasRef: Ref<HTMLCanvasElement | null> = ref(null);
const hCanvasRef: Ref<HTMLCanvasElement | null> = ref(null);

let draggingAxis: Axis = Axis.HORIZONTAL;

let clickOrigin: number = 0;

let trackOrigin: number = 0;


const props = defineProps<{
  scrollRect: ScrollRect,
  size: Dimension,
  hideVScroll: Boolean,
  hideHScroll: Boolean
}>()

// {
//   scrollRect: Object as PropType<ScrollRect>,
//   size: Object as PropType<Dimension>,
//   hideVScroll: Boolean,
//   hideHScroll: Boolean
// })

const emit = defineEmits(['update'])

let dragEventFunc!: (evt: MouseEvent) => void;

let releaseEventFunc!: (evt: MouseEvent) => void;

const handleDragEvent = (event: MouseEvent) => {
  event.stopImmediatePropagation();
  event.preventDefault();

  const canvas =
    draggingAxis == Axis.HORIZONTAL
      ? hCanvasRef.value!
      : vCanvasRef.value!,
    pt: Point = getMouseCoor(event, canvas);

  console.log(canvas, draggingAxis)

  switch (draggingAxis) {
    case Axis.HORIZONTAL:
      scrollTo(
        draggingAxis,
        trackOrigin + (pt.x - clickOrigin)
      );
      drawHorizontal();
      break;

    case Axis.VERTICAL:
      scrollTo(
        draggingAxis,
        trackOrigin + (pt.y - clickOrigin)
      );
      drawVertical();
      break;
  }
};

const handleReleaseEvent = () => {
  window.removeEventListener("pointermove", dragEventFunc, true);
  window.removeEventListener("pointerup", releaseEventFunc, true);
};

function toScrollbarCoor(axis: Axis, val: number): number {
  const scrollRect = props.scrollRect!;

  switch (axis) {
    case Axis.HORIZONTAL:
      return (
        (val / scrollRect.outerR) *
        (hCanvasRef.value!.width - SCROLLBAR_WIDTH * 2)
      );
    case Axis.VERTICAL:
      return (
        (val / scrollRect.outerB) *
        (vCanvasRef.value!.height - SCROLLBAR_WIDTH * 2)
      );
    default:
      return 0;
  }
}

function toViewportCoor(axis: Axis, val: number): number {
  const scrollRect = props.scrollRect!;

  switch (axis) {
    case Axis.HORIZONTAL:
      return (
        (val * scrollRect.outerR) /
        (hCanvasRef.value!.width - SCROLLBAR_WIDTH * 2)
      );
    case Axis.VERTICAL:
      return (
        (val * scrollRect.outerB) /
        (vCanvasRef.value!.height - SCROLLBAR_WIDTH * 2)
      );
    default:
      return 0;
  }
}

function scrollTo(axis: Axis, val: number) {
  const scrollRect = props.scrollRect!,
    rect: ScrollRect = {
      ...scrollRect
    },
    viewportVal = toViewportCoor(axis, val);

  let len: number;

  switch (axis) {
    case Axis.HORIZONTAL:
      len = scrollRect.innerR - scrollRect.innerL;
      rect.innerL = clampBetween(
        viewportVal,
        0,
        scrollRect.outerR - len
      );
      rect.innerR = rect.innerL + len;
      break;

    case Axis.VERTICAL:
      len = scrollRect.innerB - scrollRect.innerT;
      rect.innerT = clampBetween(
        viewportVal,
        0,
        scrollRect.outerB - len
      );
      rect.innerB = rect.innerT + len;

      break;
  }

  emit('update', rect);
}

// @Emit("update")
// updateScrollRect(rect: ScrollRect) {
//   return rect;
// }

// @Watch("scrollRect", { immediate: true, deep: true })
// onScrollPosChanged(scroll: ScrollRect) {
//   this.$nextTick(() => {
//     this.draw();
//   });
// }

// @Watch("size", { immediate: true })
// onSizeChange(size: Dimension) {
//   this.$nextTick(() => {
//     if (!this.hideHScroll) {
//       this.hCanvas.width = size.w + SCROLLBAR_WIDTH;
//     }
//     if (!this.hideVScroll) {
//       this.vCanvas.height = size.h;
//     }
//     this.draw();
//   });
// }

watch(() => props.scrollRect,
  () => {
    nextTick(() => {
      console.log('UPDATE SCROLL RECT FOR SCROLLBARS', props.scrollRect)
      draw();
    });
  },
  { immediate: true, deep: true });


watch(() => props.size,
  (size) => {
    nextTick(() => {
      console.log('NEW SIZE', size)
      if (!props.hideHScroll) {
        hCanvasRef.value!.width = size!.w + SCROLLBAR_WIDTH;
      }
      if (!props.hideVScroll) {
        vCanvasRef.value!.height = size!.h;
      }
    });
  },
  { immediate: true });

function drawVertical() {
  if (!vCanvasRef.value) {
    return;
  }

  const context = vCanvasRef.value.getContext("2d") as CanvasRenderingContext2D,
    scrollRect = props.scrollRect!,
    size = props.size!,
    start = toScrollbarCoor(Axis.VERTICAL, scrollRect.innerT),
    end = toScrollbarCoor(Axis.VERTICAL, scrollRect.innerB);

  context.beginPath();
  context.fillStyle = "#f0f0f0";
  context.rect(0, 0, SCROLLBAR_WIDTH, size.h);
  context.fill();

  context.beginPath();
  context.fillStyle = "#b0b0b0";
  context.rect(0, start + SCROLLBAR_WIDTH, SCROLLBAR_WIDTH, end - start);
  context.fill();

  context.drawImage(getUpArrow(), 0, 0);

  context.drawImage(getDownArrow(), 0, size.h - SCROLLBAR_WIDTH);
}

function drawHorizontal() {
  if (!hCanvasRef.value) {
    return;
  }

  const context = hCanvasRef.value.getContext("2d") as CanvasRenderingContext2D,
    scrollRect = props.scrollRect!,
    size = props.size!,
    start = toScrollbarCoor(Axis.HORIZONTAL, scrollRect.innerL),
    end = toScrollbarCoor(Axis.HORIZONTAL, scrollRect.innerR);

  context.beginPath();
  context.fillStyle = "#f0f0f0";
  context.rect(0, 0, size.w, SCROLLBAR_WIDTH);
  context.fill();

  context.beginPath();
  context.rect(0, 0, hCanvasRef.value.width, SCROLLBAR_WIDTH);
  context.fill();

  context.beginPath();
  context.fillStyle = "#b0b0b0";
  context.rect(start + SCROLLBAR_WIDTH, 0, end - start, SCROLLBAR_WIDTH);
  context.fill();

  context.drawImage(getLeftArrow(), 0, 0);

  context.drawImage(getRightArrow(), size.w - SCROLLBAR_WIDTH, 0);
}

function handleClick(
  val: number,
  clickAxis: Axis,
  start: number,
  end: number,
  scrollLen: number
) {
  const len = end - start;

  clickOrigin = val;
  trackOrigin = start;
  draggingAxis = clickAxis;

  console.log('INITIAL CLICK', vCanvasRef.value, hCanvasRef.value, draggingAxis)

  if (val < SCROLLBAR_WIDTH) {
    scrollTo(draggingAxis, start - SCROLLBAR_OFFSET);
  } else if (val > scrollLen) {
    scrollTo(draggingAxis, start + SCROLLBAR_OFFSET);
  } else {
    dragEventFunc = (evt: MouseEvent) => {
      handleDragEvent(evt);
    };

    releaseEventFunc = (evt: MouseEvent): void => {
      handleReleaseEvent();
    };

    window.addEventListener("pointerup", releaseEventFunc, true);
    window.addEventListener("pointermove", dragEventFunc, true);

    if (val < start || val > end) {
      trackOrigin = val - SCROLLBAR_OFFSET - len / 2;
      scrollTo(draggingAxis, Math.floor(trackOrigin));
    }
  }
}

function clickHorizontal(e: PointerEvent) {
  const pt: Point = getMouseCoor(e, hCanvasRef.value!),
    scrollRect = props.scrollRect!;

  handleClick(
    pt.x,
    Axis.HORIZONTAL,
    toScrollbarCoor(Axis.HORIZONTAL, scrollRect.innerL),
    toScrollbarCoor(Axis.HORIZONTAL, scrollRect.innerR),
    toScrollbarCoor(Axis.HORIZONTAL, scrollRect.outerR) +
    SCROLLBAR_WIDTH
  );
}

function clickVertical(e: PointerEvent) {
  const pt: Point = getMouseCoor(e, vCanvasRef.value!),
    scrollRect = props.scrollRect!;

  handleClick(
    pt.y,
    Axis.VERTICAL,
    toScrollbarCoor(Axis.VERTICAL, scrollRect.innerT),
    toScrollbarCoor(Axis.VERTICAL, scrollRect.innerB),
    toScrollbarCoor(Axis.VERTICAL, scrollRect.outerB) +
    SCROLLBAR_WIDTH
  );
}

function draw() {
  drawVertical();
  drawHorizontal();
}

onMounted(() => {

});

//   public mounted() {
//   this.vCanvas = this.$el.getElementsByClassName(
//     "vbar"
//   )[0] as HTMLCanvasElement;
//   this.hCanvas = this.$el.getElementsByClassName(
//     "hbar"
//   )[0] as HTMLCanvasElement;

//   this.onScrollPosChanged(this.scrollRect);
// }
// }

// @Component
// export default class CanvasScrollport extends Vue {
//   private vCanvas!: HTMLCanvasElement;
//   private hCanvas!: HTMLCanvasElement;

//   private draggingAxis: Axis = Axis.HORIZONTAL;

//   protected clickOrigin: number = 0;

//   protected trackOrigin: number = 0;

//   @Prop() scrollRect!: ScrollRect;

//   @Prop() size!: Dimension;

//   @Prop() hideVScroll!: boolean;

//   @Prop() hideHScroll!: boolean;

//   private dragEventFunc!: (evt: MouseEvent) => void;

//   private releaseEventFunc!: (evt: MouseEvent) => void;

//   private handleDragEvent = (instance: CanvasScrollport, event: MouseEvent) => {
//     event.stopImmediatePropagation();
//     event.preventDefault();

//     const canvas =
//       instance.draggingAxis == Axis.HORIZONTAL
//         ? instance.hCanvas
//         : instance.vCanvas,
//       pt: Point = getMouseCoor(event, canvas);

//     switch (instance.draggingAxis) {
//       case Axis.HORIZONTAL:
//         instance.scrollTo(
//           instance.draggingAxis,
//           instance.trackOrigin + (pt.x - instance.clickOrigin)
//         );
//         this.drawHorizontal();
//         break;

//       case Axis.VERTICAL:
//         instance.scrollTo(
//           instance.draggingAxis,
//           instance.trackOrigin + (pt.y - instance.clickOrigin)
//         );
//         this.drawVertical();
//         break;
//     }
//   };

//   private handleReleaseEvent = (instance: CanvasScrollport) => {
//     window.removeEventListener("pointermove", instance.dragEventFunc, true);
//     window.removeEventListener("pointerup", instance.releaseEventFunc, true);
//   };

//   private toScrollbarCoor(axis: Axis, val: number): number {
//     switch (axis) {
//       case Axis.HORIZONTAL:
//         return (
//           (val / this.scrollRect.outerR) *
//           (this.hCanvas.width - SCROLLBAR_WIDTH * 2)
//         );
//       case Axis.VERTICAL:
//         return (
//           (val / this.scrollRect.outerB) *
//           (this.vCanvas.height - SCROLLBAR_WIDTH * 2)
//         );
//       default:
//         return 0;
//     }
//   }

//   private toViewportCoor(axis: Axis, val: number): number {
//     switch (axis) {
//       case Axis.HORIZONTAL:
//         return (
//           (val * this.scrollRect.outerR) /
//           (this.hCanvas.width - SCROLLBAR_WIDTH * 2)
//         );
//       case Axis.VERTICAL:
//         return (
//           (val * this.scrollRect.outerB) /
//           (this.vCanvas.height - SCROLLBAR_WIDTH * 2)
//         );
//       default:
//         return 0;
//     }
//   }

//   private scrollTo(axis: Axis, val: number) {
//     const rect: ScrollRect = {
//       ...this.scrollRect
//     },
//       viewportVal = this.toViewportCoor(axis, val);

//     let len: number;

//     switch (axis) {
//       case Axis.HORIZONTAL:
//         len = this.scrollRect.innerR - this.scrollRect.innerL;
//         rect.innerL = clampBetween(
//           viewportVal,
//           0,
//           this.scrollRect.outerR - len
//         );
//         rect.innerR = rect.innerL + len;
//         break;

//       case Axis.VERTICAL:
//         len = this.scrollRect.innerB - this.scrollRect.innerT;
//         rect.innerT = clampBetween(
//           viewportVal,
//           0,
//           this.scrollRect.outerB - len
//         );
//         rect.innerB = rect.innerT + len;

//         break;
//     }
//     this.updateScrollRect(rect);
//   }

//   @Emit("update")
//   updateScrollRect(rect: ScrollRect) {
//     return rect;
//   }

//   @Watch("scrollRect", { immediate: true, deep: true })
//   onScrollPosChanged(scroll: ScrollRect) {
//     this.$nextTick(() => {
//       this.draw();
//     });
//   }

//   @Watch("size", { immediate: true })
//   onSizeChange(size: Dimension) {
//     this.$nextTick(() => {
//       if (!this.hideHScroll) {
//         this.hCanvas.width = size.w + SCROLLBAR_WIDTH;
//       }
//       if (!this.hideVScroll) {
//         this.vCanvas.height = size.h;
//       }
//       this.draw();
//     });
//   }

//   public drawVertical() {
//     if (!this.vCanvas) {
//       return;
//     }

//     const context = this.vCanvas.getContext("2d") as CanvasRenderingContext2D,
//       start = this.toScrollbarCoor(Axis.VERTICAL, this.scrollRect.innerT),
//       end = this.toScrollbarCoor(Axis.VERTICAL, this.scrollRect.innerB);

//     context.beginPath();
//     context.fillStyle = "#f0f0f0";
//     context.rect(0, 0, SCROLLBAR_WIDTH, this.size.h);
//     context.fill();

//     context.beginPath();
//     context.fillStyle = "#b0b0b0";
//     context.rect(0, start + SCROLLBAR_WIDTH, SCROLLBAR_WIDTH, end - start);
//     context.fill();

//     context.drawImage(getUpArrow(), 0, 0);

//     context.drawImage(getDownArrow(), 0, this.size.h - SCROLLBAR_WIDTH);
//   }

//   public drawHorizontal() {
//     if (!this.hCanvas) {
//       return;
//     }

//     const context = this.hCanvas.getContext("2d") as CanvasRenderingContext2D,
//       start = this.toScrollbarCoor(Axis.HORIZONTAL, this.scrollRect.innerL),
//       end = this.toScrollbarCoor(Axis.HORIZONTAL, this.scrollRect.innerR);

//     context.beginPath();
//     context.fillStyle = "#f0f0f0";
//     context.rect(0, 0, this.size.w, SCROLLBAR_WIDTH);
//     context.fill();

//     context.beginPath();
//     context.rect(0, 0, this.hCanvas.width, SCROLLBAR_WIDTH);
//     context.fill();

//     context.beginPath();
//     context.fillStyle = "#b0b0b0";
//     context.rect(start + SCROLLBAR_WIDTH, 0, end - start, SCROLLBAR_WIDTH);
//     context.fill();

//     context.drawImage(getLeftArrow(), 0, 0);

//     context.drawImage(getRightArrow(), this.size.w - SCROLLBAR_WIDTH, 0);
//   }

//   private handleClick(
//     val: number,
//     draggingAxis: Axis,
//     start: number,
//     end: number,
//     scrollLen: number
//   ) {
//     const len = end - start,
//       self = this;
//     this.draggingAxis = draggingAxis;

//     this.clickOrigin = val;
//     this.trackOrigin = start;

//     if (val < SCROLLBAR_WIDTH) {
//       this.scrollTo(this.draggingAxis, start - SCROLLBAR_OFFSET);
//     } else if (val > scrollLen) {
//       this.scrollTo(this.draggingAxis, start + SCROLLBAR_OFFSET);
//     } else {
//       this.dragEventFunc = (evt: MouseEvent) => {
//         self.handleDragEvent(self, evt);
//       };

//       this.releaseEventFunc = (evt: MouseEvent): void => {
//         self.handleReleaseEvent(self);
//       };

//       window.addEventListener("pointerup", this.releaseEventFunc, true);
//       window.addEventListener("pointermove", this.dragEventFunc, true);

//       if (val < start || val > end) {
//         this.trackOrigin = val - SCROLLBAR_OFFSET - len / 2;
//         this.scrollTo(this.draggingAxis, Math.floor(this.trackOrigin));
//       }
//     }
//   }

//   public clickHorizontal(e: PointerEvent) {
//     const pt: Point = getMouseCoor(e, this.hCanvas);

//     this.handleClick(
//       pt.x,
//       Axis.HORIZONTAL,
//       this.toScrollbarCoor(Axis.HORIZONTAL, this.scrollRect.innerL),
//       this.toScrollbarCoor(Axis.HORIZONTAL, this.scrollRect.innerR),
//       this.toScrollbarCoor(Axis.HORIZONTAL, this.scrollRect.outerR) +
//       SCROLLBAR_WIDTH
//     );
//   }

//   public clickVertical(e: PointerEvent) {
//     const pt: Point = getMouseCoor(e, this.vCanvas);

//     this.handleClick(
//       pt.y,
//       Axis.VERTICAL,
//       this.toScrollbarCoor(Axis.VERTICAL, this.scrollRect.innerT),
//       this.toScrollbarCoor(Axis.VERTICAL, this.scrollRect.innerB),
//       this.toScrollbarCoor(Axis.VERTICAL, this.scrollRect.outerB) +
//       SCROLLBAR_WIDTH
//     );
//   }

//   public draw() {
//     this.drawVertical();
//     this.drawHorizontal();
//   }

//   public mounted() {
//     this.vCanvas = this.$el.getElementsByClassName(
//       "vbar"
//     )[0] as HTMLCanvasElement;
//     this.hCanvas = this.$el.getElementsByClassName(
//       "hbar"
//     )[0] as HTMLCanvasElement;

//     this.onScrollPosChanged(this.scrollRect);
//   }
// }
</script>

<style scoped>
div.canvas-container {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  line-height: 0;
}

canvas.vbar {
  top: 0px;
  right: 0px;
}

canvas.hbar {
  left: 0;
  bottom: 0;
}
</style>
