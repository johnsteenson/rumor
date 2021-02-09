import { Nullable } from '@rumor/common';


export interface TreeItem {
  id: string;
  label: string;
  icon?: string;
  disableSelect?: boolean;
  children?: TreeItem[];
};

export interface TreeState {
  selected: Nullable<string>;
  collapsed: any;
}
