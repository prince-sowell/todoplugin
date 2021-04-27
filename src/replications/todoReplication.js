import { SubscriptionClient } from "subscriptions-transport-ws";
import {
  todoPullQueryBuilder,
  todoPushQueryBuilder,
} from "../queryBuilder/todoQueryBuilder ";

export const initTodoReplication = async (
  SECRET,
  URLWEBSOCKET,
  SYNCURL,
  db
) => {
  const batchSize = 5;
  // Start Replication every 10 min
  const todoReplicationState = db.todos.syncGraphQL({
    url: SYNCURL,
    headers: {
      "x-hasura-admin-secret": SECRET,
    },
    push: {
      batchSize,
      queryBuilder: todoPushQueryBuilder,
    },
    pull: {
      batchSize,
      queryBuilder: todoPullQueryBuilder,
    },
    live: true,
    liveInterval: 1000 * 60 * 60,
    deletedFlag: "deleted",
  });
  // Error log
  todoReplicationState.error$.subscribe((err) => {
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
              subscription{
                todo {
                  id
                  text
                  isCompleted
                  updated_at
                  user_id
                }
              }`;

  const changeObservable = wsClient.request({ query });
  changeObservable.subscribe({
    next(data) {
      console.log("subscription emitted todo => trigger run");
      todoReplicationState.run();
    },
    error(error) {
      console.log("got error:");
      console.dir(error);
    },
  });
  return todoReplicationState;
};
