import { App } from "vue";

import AccountIcon from "vue-material-design-icons/Account.vue";
import BrushIcon from "vue-material-design-icons/Brush.vue";
import EarthIcon from "vue-material-design-icons/Earth.vue";
import FileDocumentBoxOutline from "vue-material-design-icons/FileDocumentOutline.vue";
import FolderOutline from "vue-material-design-icons/FolderOutline.vue";
import FormatColorFillIcon from "vue-material-design-icons/FormatColorFill.vue";
import GithubIcon from "vue-material-design-icons/Github.vue";
import MinusBoxMultipleOutline from "vue-material-design-icons/MinusBoxMultipleOutline.vue";
import Numeric1BoxMultiple from "vue-material-design-icons/Numeric1BoxMultiple.vue";
import Numeric2BoxMultiple from "vue-material-design-icons/Numeric2BoxMultiple.vue";
import PlusBoxMultipleOutline from "vue-material-design-icons/PlusBoxMultipleOutline.vue";
import ShapeRectanglePlus from "vue-material-design-icons/ShapeRectanglePlus.vue";
import Undo from "vue-material-design-icons/Undo.vue";




export default {
  install: (app: App) => {
    app.component('icon-account', AccountIcon);
    app.component('icon-brush', BrushIcon);
    app.component('icon-earth', EarthIcon);
    app.component('icon-format-color-fill', FormatColorFillIcon);
    app.component('icon-github', GithubIcon);
    app.component('icon-file-document-box-outline', FileDocumentBoxOutline);
    app.component('icon-folder-outline', FolderOutline);
    app.component('icon-minus-box-multiple-outline', MinusBoxMultipleOutline);
    app.component('icon-numeric-1-box-multiple', Numeric1BoxMultiple);
    app.component('icon-numeric-2-box-multiple', Numeric2BoxMultiple);
    app.component('icon-plus-box-multiple-outline', PlusBoxMultipleOutline);
    app.component('icon-shape-rectangle-plus', ShapeRectanglePlus);
    app.component('icon-undo', Undo);

  }
}