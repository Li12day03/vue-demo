import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import {createPinia} from "pinia";
import permission from "./directives/permission";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

const pinia = createPinia();

createApp(App)
  .use(router)
  .use(pinia)
  .use(ElementPlus)
  .directive("permission", permission)
  .mount("#app");
