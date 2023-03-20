import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { Dimension } from '@rumor/common';

export interface ProjectState {
  title: string;
  offline: boolean,
  loggedIn: boolean,
  defaultTileSize: Dimension;
  signedInUser: string;
}

const state: ProjectState = {
  title: 'My Kewl Project',
  defaultTileSize: {
    w: 16,
    h: 16,
  },
  loggedIn: false,
  offline: false,
  signedInUser: ""
};

export const projectModule = {
  namespaced: true,
  state: (): ProjectState => (state),
  getters,
  actions,
  mutations
}

