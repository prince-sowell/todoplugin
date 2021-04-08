import { initDatabase } from "./initDataBase";
import { initReplication } from "./replication";

export default {
  install(app) {
    const todoPlugin = {
      replication: initReplication,
      DB: initDatabase,
    };

    app.config.globalProperties.$todoPlugin = todoPlugin;
  },
};
