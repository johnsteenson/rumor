import { InjectionKey } from 'vue';
import { createStore, Store, StoreOptions, useStore as baseUseStore } from 'vuex';
import { ProjectState, projectModule } from './project';
import { worldModule } from './world';

import { createPlugin } from './plugin';

interface RootState {
  version: string;
  project: ProjectState
}

const state = {
  version: '1.0.0'
};

export const storeKey: InjectionKey<Store<RootState>> = Symbol();

export const store = createStore<RootState>({
  state: state as RootState,
  modules: {
    project: projectModule,
    world: worldModule,
  },
  plugins: [
    createPlugin()
  ]
});

export const useStore = () => {
  return baseUseStore(storeKey);
}
