import { SubscriptionClient } from "subscriptions-transport-ws";
import { TODOBASE } from "./initDataBase";
// more info on params: https://quasar.dev/quasar-cli/boot-files
// something to do
if (isAuth) {
  const batchSize = 5;
  const pullQueryBuilder = (doc) => {
    if (!doc) {
      doc = {
        id: "",
        updated_at: new Date(0).toUTCString(),
      };
    }
    const query = `
            query listTodos {
                todo(
                  where: {
                    _or: [
                        {updated_at: {_gt: "${doc.updated_at}"}}
                    ]
                },
                limit: ${batchSize},
                order_by: [{updated_at: asc}, {id: asc}]
                ) {
                  id
                  text
                  isCompleted
                  deleted
                  created_at
                  updated_at
                }
              }`;
    return {
      query,
      variables: {},
    };
  };

  const pushQueryBuilder = (doc) => {
    const query = `
                mutation InsertTodo($todo: [todo_insert_input!]!) {
                  insert_todo(objects: $todo, on_conflict: {constraint: todo_pkey, update_columns: [text, isCompleted, deleted, updated_at]}) {
                    returning {
                      id
                    }
                  }
                }
              `;
    const variables = {
      todo: doc,
    };
    return {
      query,
      variables,
    };
  };

  // Start Replication every 10 seconds

  const replicationState = TODOBASE.todos.syncGraphQL({
    url: process.env.SYNCURL,
    headers: {
      "x-hasura-admin-secret": process.env.SECRET,
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
    deletedFlag: "deleted",
  });
  // Error log
  replicationState.error$.subscribe((err) => {
    console.log("replication error:");
    console.dir(err);
  });
  // Error log
  replicationUser.error$.subscribe((err) => {
    console.log("replication error:");
    console.dir(err);
  });

  // setup the subscription client
  // Ici Pour reduire le temps de latence du serveur
  const wsClient = new SubscriptionClient(process.env.URLWEBSOCKET, {
    reconnect: true,
    connectionParams: {
      headers: {
        "x-hasura-admin-secret": process.env.SECRET,
      },
    },
    connectionCallback: () => {
      console.log("SubscriptionClient.connectionCallback:");
    },
    reconnectionAttempts: 1000,
    inactivityTimeout: 10 * 1000,
  });

  const query = `
            subscription{
              todo {
                id
              }
            }`;

  const changeObservable = wsClient.request({ query });
  changeObservable.subscribe({
    next(data) {
      console.log("subscription emitted => trigger run");
      replicationState.run();
    },
    error(error) {
      console.log("got error:");
      console.dir(error);
    },
  });
} else {
  console.log("disconnected");
}
