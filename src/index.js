import {
  getDB,
  createDb,
  initTodoReplication,
  getCollection,
} from "./replication/replication";

export default {
  install: (app) => {
    const rxdb = {
      getDB: getDB,
      createDb: createDb,
      initTodoReplication: initTodoReplication,
      getCollection: getCollection,
    };
    app.provide("DB", rxdb);
  },
};
