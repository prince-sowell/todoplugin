import { createRxDatabase, addRxPlugin } from "rxdb";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { LocalStorage } from "quasar";

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

let localDB = null;
let collections = [];
let replicationStates = [];
let wsClient = null;
let collectionsName = [];
let SECRET = "";
let URLWEBSOCKET = "";
let SYNCURL = "";
let schema = null;
let queryBuilders = null;

/**
 * public function
 */

export const initRxdb = (
  secret,
  urlwebsocket,
  syncURL,
  querys,
  collectionSchema
) => {
  SECRET = secret;
  URLWEBSOCKET = urlwebsocket;
  SYNCURL = syncURL;
  queryBuilders = querys;
  schema = collectionSchema;
};

export const stopReplication = () => {
  if (replicationStates.length && wsClient !== null) {
    replicationStates.map((replication) => {
      replication.cancel();
    });
    wsClient.close();
    collectionsName = [];
    replicationStates = [];
    wsClient = null;
    localDB = null;
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
    // ajout de collection et son nom
    Object.entries(schema).map(async ([key, value]) => {
      const obj = {};
      obj[key] = {
        schema: value,
      };
      collectionsName.push(key);
      collections.push(await TODOBASE.addCollections(obj));
    });
    LocalStorage.set("dbName", name);
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

export const initReplication = async () => {
  const batchSize = 5;
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
  collectionsName.map(async (name) => {
    const collection = getCollection(name);
    const { subQuery, pullQueryBuilder, pushQueryBuilder } = setupQuery(name);

    if (collection) {
      const replicationState = await collection.syncGraphQL({
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
      replicationStates.push(replicationState);
      subscribe(replicationState, subQuery);
    } else {
      throw "error replication verify your name of collection";
    }
  });
};

/**
 * private function
 */

const setupQuery = (collectionName) => {
  let pullQueryBuilder = null;
  let pushQueryBuilder = null;
  let subQuery = null;
  queryBuilders[collectionName].findIndex((coll, index) => {
    for (let [key, value] of Object.entries(coll)) {
      if (key === "pull") {
        pullQueryBuilder = value;
      }
      if (key == "push") {
        pushQueryBuilder = value;
      }
      if (key == "sub") {
        subQuery = value;
      }
    }
  });
  return { pullQueryBuilder, pushQueryBuilder, subQuery };
};

const subscribe = (replicationState, query) => {
  let changeObservable = wsClient.request({ query });
  changeObservable.subscribe({
    next(data) {
      console.log("subscription emitted => trigger run");
      replicationState.run();
    },
    error(error) {
      throw error;
    },
  });
  // Error log
  replicationState.error$.subscribe((err) => {
    throw err;
  });
};
