import { createRxDatabase, addRxPlugin } from "rxdb";
import { SubscriptionClient } from "subscriptions-transport-ws";

import { RxDBValidatePlugin } from "rxdb/plugins/validate";
import * as PouchdbAdapterIdb from "pouchdb-adapter-idb";
import { RxDBReplicationPlugin } from "rxdb/plugins/replication";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDBReplicationGraphQLPlugin } from "rxdb/plugins/replication-graphql";
import { LocalStorage } from "quasar";

//plugins use By RxDb
addRxPlugin(RxDBReplicationGraphQLPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBValidatePlugin);
addRxPlugin(RxDBReplicationPlugin);
addRxPlugin(PouchdbAdapterIdb);
addRxPlugin(RxDBUpdatePlugin);

let localDB = null;
let collections = [];
let replicationState = null;
let wsClient = null;

let SECRET = "";
let URLWEBSOCKET = "";
let SYNCURL = "";
let query = null;
let schema = null;
let pullQueryBuilder = null;
let pushQueryBuilder = null;

let queryBuilders = null;

export const initRxdb = (
  secret,
  urlwebsocket,
  syncURL,
  subscriptionQuery,
  pullQuery,
  collectionSchema
) => {
  SECRET = secret;
  URLWEBSOCKET = urlwebsocket;
  SYNCURL = syncURL;
  query = subscriptionQuery;
  queryBuilders = pullQuery;
  schema = collectionSchema;
};

export const restartReplication = async () => {
  const dbName = LocalStorage.getItem("dbName");
  const collectionName = LocalStorage.getItem("collectionName");
  await createDb(dbName);
  setTimeout(() => {
    collectionName.map(async (name) => {
      await initReplication(name);
    });
    //map
  }, 1000);
};
export const stopReplication = () => {
  if (replicationState !== null && wsClient !== null) {
    replicationState.cancel();
    wsClient.close();
  } else {
    throw "No replication state";
  }
};

export const createDb = async (name) => {
  if (name !== undefined) {
    console.log("DatabaseService: creating database..");
    const TODOBASE = await createRxDatabase({
      name: `sw_${name}`,
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
      collections.push(await TODOBASE.addCollections(obj));
    });
    localDB = TODOBASE;
    return TODOBASE;
  } else {
    throw "database must have a name";
  }
};

export const getDB = () => {
  if (localDB !== null) {
    return localDB;
  } else {
    throw "Database doesn't exist";
  }
};

export const getCollection = (name) => {
  if (name !== undefined) {
    let collection = null;
    collections.findIndex((coll, index) => {
      for (let [key, value] of Object.entries(coll)) {
        if (key === name) {
          collection = value;
        }
      }
    });
    if (name !== null) {
      return collection;
    } else {
      throw `collection "${name}" doesn't exist `;
    }
  }
};

const setupQueryBuilder = (collectionName) => {
  let array = queryBuilders[collectionName];
  array.findIndex((coll, index) => {
    for (let [key, value] of Object.entries(coll)) {
      if (key === "pull") {
        pullQueryBuilder = value;
      }
      if (key == "push") {
        pushQueryBuilder = value;
      }
    }
  });
};

export const initReplication = async (collectionName) => {
  const batchSize = 5;

  const collection = getCollection(collectionName);
  setupQueryBuilder(collectionName);

  if (collection) {
    replicationState = await collection.syncGraphQL({
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
      throw err;
    });
    // setup the subscription client
    // Ici Pour reduire le temps de latence du serveur
    wsClient = new SubscriptionClient(URLWEBSOCKET, {
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
        throw error;
      },
    });
  } else {
    throw "error replication verify your name of collection";
  }
};
