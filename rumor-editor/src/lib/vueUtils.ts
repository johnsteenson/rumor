import Vue from 'vue';

// const vm = new Vue();

// TODO - may not be needed anymore -- potentially remove
export function blockReactivity(obj: any) {
  // const Observer = vm.$data.__ob__.constructor;

  // obj.__ob__ = new Observer({});
  return obj;
}
