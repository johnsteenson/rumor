import { ActionTree } from 'vuex';
import { WorldState } from './types';

import { mapStore } from "@/world";

export const actions = {
  setTool({ commit }: { commit: Function }, toolId: number) {
    commit('setTool', toolId);
  },

  undo() {
    mapStore.mapMutator.undo();
  },

  setLayer({ commit }: { commit: Function }, layerId: number) {
    commit('setLayer', layerId);
  }

};
