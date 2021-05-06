import {
  getDB,
  createDb,
  initReplication,
  getCollection,
  initRxdb,
  stopReplication,
} from "./replication/replication";

export default {
  install: (app) => {
    const rxdb = {
      getDB: getDB,
      createDb: createDb,
      initReplication: initReplication,
      getCollection: getCollection,
    };
    app.provide("DB", rxdb);
    app.provide("stopReplication", stopReplication);
    app.config.globalProperties.$initRxdb = initRxdb;
    app.config.globalProperties.$createDb = createDb;
    app.config.globalProperties.$initReplication = initReplication;
  },
};
