import "./App/Styles/index.scss";

import App from "./App.vue";
import { createApp } from "vue";

const _app = createApp(App);

import { createPinia } from "pinia";
_app.use(createPinia());

import { router } from "@/App/Infra/routes";
_app.use(router);

import { naiveUiComponents } from "@/App/Components/naive-ui-components";
import { frontlineComponents } from "@/App/Components/frontline-components";
// naiveComponents.forEach((element) => {
//   _app.component(element.name, element.component);
// });
naiveUiComponents.forEach(({ name, component }) => {
  _app.component(name, component);
});

frontlineComponents.forEach(({ name, component }) => {
  _app.component(name, component);
});

_app.mount("#app");
