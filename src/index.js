import { TODOBASE } from "./initDataBase";

export default {
  install(Vue) {
    const todoBase = {
      DB: TODOBASE,
    };

    Vue.prototype.$todoBase = todoBase;
  },
};
