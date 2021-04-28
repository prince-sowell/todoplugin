import {
  getDB,
  createDb,
  initTodoReplication,
} from "./replication/replication";

export default {
  install: (app) => {
    const rxdb = {
      getDB: getDB,
      createDb: createDb,
      initTodoReplication: initTodoReplication,
    };
    app.provide("DB", rxdb);
  },
};
