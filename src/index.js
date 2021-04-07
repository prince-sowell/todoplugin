import { initDatabase } from "./initDataBase";

export default {
  install(Vue) {
    const todoBase = {
      DB: initDatabase,
    };

    Vue.prototype.$todoBase = todoBase;
  },
};
