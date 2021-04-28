import { createRxDatabase, addRxPlugin } from "rxdb";
import { SubscriptionClient } from "subscriptions-transport-ws";

import { RxDBValidatePlugin } from "rxdb/plugins/validate";
import * as PouchdbAdapterIdb from "pouchdb-adapter-idb";
import { RxDBReplicationPlugin } from "rxdb/plugins/replication";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDBReplicationGraphQLPlugin } from "rxdb/plugins/replication-graphql";

//plugins use By RxDb
addRxPlugin(RxDBReplicationGraphQLPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBValidatePlugin);
addRxPlugin(RxDBReplicationPlugin);
addRxPlugin(PouchdbAdapterIdb);
addRxPlugin(RxDBUpdatePlugin);

// more info on params: https://quasar.dev/quasar-cli/boot-files
// something to do

let localDB = null;

export const createDb = async (name, schema) => {
  if (name !== "" && schema !== undefined) {
    console.log("DatabaseService: creating database..");
    const TODOBASE = await createRxDatabase({
      name: `todo_${name}`,
      adapter: "idb",
      ignoreDuplicate: true,
    });
    console.log("DatabaseService: created database");
    // ajout de chaque collection
    Object.entries(schema).map(async ([key, value]) => {
      const obj = {};
      obj[key] = {
        schema: value,
      };
      await TODOBASE.addCollections(obj);
    });
    localDB = TODOBASE;
    return TODOBASE;
  }
};

export const getDB = () => {
  if (localDB !== null) {
    return localDB;
  } else {
    console.log("don't reload");
  }
};

export const initTodoReplication = async (
  SECRET,
  URLWEBSOCKET,
  SYNCURL,
  query,
  pushQueryBuilder,
  pullQueryBuilder
) => {
  const batchSize = 5;
  console.log("collection", collections);

  // Start Replication every 10 min
  const replicationState = await localDB.todos.syncGraphQL({
    url: SYNCURL,
    headers: {
      "x-hasura-admin-secret": SECRET,
    },
    push: {
      batchSize,
      queryBuilder: pushQueryBuilder,
    },
    pull: {
      batchSize,
      queryBuilder: pullQueryBuilder,
    },
    live: true,
    liveInterval: 1000 * 60 * 60,
    deletedFlag: "deleted",
  });
  // Error log
  replicationState.error$.subscribe((err) => {
    console.log("replication error:");
    console.dir(err);
  });
  // setup the subscription client
  // Ici Pour reduire le temps de latence du serveur
  const wsClient = new SubscriptionClient(URLWEBSOCKET, {
    reconnect: true,
    connectionParams: {
      headers: {
        "x-hasura-admin-secret": SECRET,
      },
    },
    connectionCallback: () => {
      console.log("SubscriptionClient.connectionCallback:");
    },
  });

  const changeObservable = wsClient.request({ query });
  changeObservable.subscribe({
    next(data) {
      console.log("subscription emitted todo => trigger run");
      replicationState.run();
    },
    error(error) {
      console.log("got error:");
      console.dir(error);
    },
  });
  return replicationState;
};
