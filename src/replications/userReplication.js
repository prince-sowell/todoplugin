import { SubscriptionClient } from "subscriptions-transport-ws";

import {
  userPullQueryBuilder,
  userPushQueryBuilder,
} from "../queryBuilder/userQueryBuilder";

export const initUserReplication = async (
  SECRET,
  URLWEBSOCKET,
  SYNCURL,
  db
) => {
  const batchSize = 5;
  // Start Replication every 10 min

  const userReplicationState = db.users.syncGraphQL({
    url: SYNCURL,
    headers: {
      "x-hasura-admin-secret": SECRET,
    },
    push: {
      batchSize,
      queryBuilder: userPushQueryBuilder,
    },
    pull: {
      batchSize,
      queryBuilder: userPullQueryBuilder,
    },
    live: true,
    deletedFlag: "deleted",
    liveInterval: 1000 * 60 * 60,
  });
  // Error log
  userReplicationState.error$.subscribe((err) => {
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

  const query = `
              subscription {
                users {
                  id
                }
              }`;

  const changeObservable = wsClient.request({ query });
  changeObservable.subscribe({
    next(data) {
      console.log("subscription emitted users => trigger run");
      userReplicationState.run();
    },
    error(error) {
      console.log("got error:");
      console.dir(error);
    },
  });
};
