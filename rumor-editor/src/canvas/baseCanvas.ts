import { TileSize, Rect, Point, Dimension, ScrollRect } from "@rumor/common";

import { clampBetween } from "@/lib/utils";

import * as resizeHandler from "@/lib/resizeHandler";

import {
  getLeftArrow,
  getRightArrow,
  getUpArrow,
  getDownArrow
} from "@/canvas/utils";
import { reactive, ref, Ref, watch } from "vue";

const SCROLLBAR_WIDTH = 16;
const SCROLLBAR_OFFSET = 8;


export function useBaseCanvas(props: any, containerRef: Ref<HTMLElement | null>, canvasRef: Ref<HTMLCanvasElement | null>) {
  let drawArea: Dimension = reactive({
    w: 0,
    h: 0
  });

  let containerArea: Dimension = reactive({
    w: 0,
    h: 0
  });

  const scrollRect: ScrollRect = reactive({
    innerL: 0,
    innerR: 0,
    outerL: 0,
    outerR: 0,
    innerT: 0,
    outerT: 0,
    innerB: 0,
    outerB: 0
  });

  // Private
  const scrollbarWidth = SCROLLBAR_WIDTH;

  /* The maximum draw area for a component.  This is used when we don't want a component to resize beyond a certain width (e.g. Tileset Palette) */
  const maxDrawArea: Dimension = reactive({
    w: 9999,
    h: 9999
  });

  // // TODO: Make props
  // const hideHScroll = false;
  // const hideVScroll = false;

  // Setup resize handler

  watch(containerRef, (container) => {
    if (container) {
      resizeHandler.add(container, doResize);
    }
  }, { immediate: false, deep: false });

  //   this.$nextTick(() => {
  //     this.doResize.call(
  //       this,
  //       this.$el,
  //       this.$el.getBoundingClientRect() as DOMRect
  //     );
  //     /// this.$forceUpdate();
  //   });


  function setMaxDrawArea(w: number, h: number) {
    maxDrawArea.w = w;
    maxDrawArea.h = h;
  }

  function forceResizeEvent() {
    if (!canvasRef.value || !containerRef.value) {
      return;
    }

    const el = containerRef.value,
      compStyles = window.getComputedStyle(el),
      boundingRect = el.getBoundingClientRect(),
      borderXOffset =
        parseFloat(compStyles.getPropertyValue("border-left-width")) +
        parseFloat(compStyles.getPropertyValue("border-right-width")),
      borderYOffset =
        parseFloat(compStyles.getPropertyValue("border-top-width")) +
        parseFloat(compStyles.getPropertyValue("border-bottom-width"));

    console.log(`[${props.name}] calling forceResizeEvent`, {
      x: boundingRect.left,
      y: boundingRect.top,
      width: boundingRect.width - borderXOffset,
      height: boundingRect.height - borderYOffset
    })

    doResize(el, {
      x: boundingRect.left,
      y: boundingRect.top,
      width: boundingRect.width - borderXOffset,
      height: boundingRect.height - borderYOffset
    } as DOMRect);
  }

  function doResize(el: Element, rect: DOMRect) {
    if (!canvasRef.value) {
      return;
    }

    const canvas = canvasRef.value,
      hScrollOffset = props.hideHScroll ? 0 : SCROLLBAR_WIDTH,
      vScrollOffset = props.hideVScroll ? 0 : SCROLLBAR_WIDTH,
      w = Math.floor(rect.width) - vScrollOffset,
      h = Math.floor(rect.height);

    /* TODO:  Make this so the logical units of the canvas is constant rather than an upper bound */
    if (rect.width > maxDrawArea.w) {
      drawArea.w = maxDrawArea.w;
      drawArea.h = Math.floor(h * (drawArea.w / canvas.clientWidth));

      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      // const context = canvas.getContext('2d');
      // context?.scale(1, drawArea.w / canvas.clientWidth);

      // console.log(canvas);
      // console.log(el.getElementsByClassName('drawable'));

      // console.log(`Draw Area drawArea.w=${drawArea.w} h=${h} canvas.width=${canvas.width} canvas.clientWidth=${canvas.clientWidth} val = ${drawArea.h}`);
    } else {
      drawArea.w = Math.floor(w);
      drawArea.h = Math.floor(h);
    }

    if (canvas.width !== drawArea.w) {
      canvas.width = drawArea.w;
    }
    if (canvas.height !== drawArea.h) {
      canvas.height = drawArea.h;
    }

    containerArea.w = canvas.clientWidth;
    containerArea.h = h;

    scrollRect.innerR = scrollRect.innerL + drawArea.w;
    scrollRect.innerB = scrollRect.innerT + drawArea.h;

    clipViewport();

    console.log(`[${props.name}] called doResize`, {
      rect,
      w,
      h,
      scrollRect,
      drawArea,
      containerArea
    });

    props.onResize();
  }

  function clipViewport() {
    /* Clip visible area scroll rect (inner) to make sure it doesn't fall outside of total scroll rect (outer) */
    scrollRect.innerL = clampBetween(
      scrollRect.innerL,
      scrollRect.outerL,
      scrollRect.outerR
    );
    scrollRect.innerR = clampBetween(
      scrollRect.innerR,
      scrollRect.outerL,
      scrollRect.outerR
    );
    scrollRect.innerT = clampBetween(
      scrollRect.innerT,
      scrollRect.outerT,
      scrollRect.outerB
    );
    scrollRect.innerB = clampBetween(
      scrollRect.innerB,
      scrollRect.outerT,
      scrollRect.outerB
    );
  }

  function setViewport(viewport: Rect) {
    scrollRect.outerL = viewport.l;
    scrollRect.outerR = viewport.r;
    scrollRect.outerT = viewport.t;
    scrollRect.outerB = viewport.b;

    clipViewport();
    forceResizeEvent();
  }

  function scrollViewport(xVal: number, yVal: number) {
    if (xVal !== 0) {
      const len = scrollRect.innerR - scrollRect.innerL;

      scrollRect.innerL = clampBetween(
        scrollRect.innerL + xVal,
        scrollRect.outerL,
        scrollRect.outerR - len
      );
      scrollRect.innerR = scrollRect.innerL + drawArea.w;
    }

    if (yVal !== 0) {
      const len = scrollRect.innerB - scrollRect.innerT;

      scrollRect.innerT = clampBetween(
        scrollRect.innerT + yVal,
        scrollRect.outerT,
        scrollRect.outerB - len
      );
      scrollRect.innerB = scrollRect.innerT + drawArea.h;
    }

    props.onResize();
  }

  function scrollViewportTo(xVal: number, yVal: number) {
    scrollRect.innerL = xVal;
    scrollRect.innerT = yVal;

    const xLen = scrollRect.innerR - scrollRect.innerL;
    const yLen = scrollRect.innerB - scrollRect.innerT;

    scrollRect.innerL = clampBetween(
      scrollRect.innerL,
      scrollRect.outerL,
      scrollRect.outerR - xLen
    );
    scrollRect.innerR = scrollRect.innerL + drawArea.w;

    scrollRect.innerT = clampBetween(
      scrollRect.innerT,
      scrollRect.outerT,
      scrollRect.outerB - yLen
    );
    scrollRect.innerB = scrollRect.innerT + drawArea.h;

    props.onResize();
  }

  function updateScrollRect(rect: ScrollRect) {
    /* Values must be assigned individually.  Otherwise, it will overwrite the reactive wrapper
       and scrollRect will lose reactivity */
    scrollRect.innerB = rect.innerB;
    scrollRect.innerL = rect.innerL;
    scrollRect.innerR = rect.innerR;
    scrollRect.innerT = rect.innerT;
    scrollRect.outerB = rect.outerB;
    scrollRect.outerL = rect.outerL;
    scrollRect.outerR = rect.outerR;
    scrollRect.outerT = rect.outerT;

    props.onResize();
  }

  return {
    canvasRef,
    containerArea,
    drawArea,
    maxDrawArea,
    scrollRect,
    hideHScroll: props.hideHScroll,
    hideVScroll: props.hideVScroll,
    clipViewport,
    forceResizeEvent,
    scrollViewport,
    scrollViewportTo,
    setMaxDrawArea,
    setViewport,
    updateScrollRect
  }

}


export type BaseCanvas = ReturnType<typeof useBaseCanvas>;
