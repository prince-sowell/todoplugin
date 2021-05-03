import {
  getDB,
  createDb,
  initReplication,
  getCollection,
  initRxdb,
  restartReplication,
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
    app.config.globalProperties.$restartReplication = restartReplication;
    app.config.globalProperties.$createDb = createDb;
  },
};
