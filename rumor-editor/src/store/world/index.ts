import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { WorldState } from './types';
import { ToolType } from '@rumor/common';

const namespaced: boolean = true,
  state: WorldState = {
    tool: ToolType.PENCIL,
    tileSelection: {
      tileIndices: [0],
      w: 1,
      h: 1,
    },
    curSection: 0,
    curLayer: 0,
    mapScale: 2,
    componentScale: 2,
    changes: [],
  };

export const worldModule = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
