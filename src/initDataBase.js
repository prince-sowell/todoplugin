// import something here
import todoSchema from "./schema/TodoSchema";
import { createRxDatabase, addRxPlugin } from "rxdb";

//plugins use By RxDb
import { RxDBValidatePlugin } from "rxdb/plugins/validate";
import * as PouchdbAdapterIdb from "pouchdb-adapter-idb";
import { RxDBReplicationPlugin } from "rxdb/plugins/replication";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { RxDBReplicationGraphQLPlugin } from "rxdb/plugins/replication-graphql";

addRxPlugin(RxDBReplicationGraphQLPlugin);

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBValidatePlugin);
addRxPlugin(RxDBReplicationPlugin);
addRxPlugin(PouchdbAdapterIdb);
addRxPlugin(RxDBUpdatePlugin);

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
// something to do
console.log("DatabaseService: creating database..");
export const TODOBASE = await createRxDatabase({
  name: "todo",
  adapter: "idb",
});

console.log("DatabaseService: created database");
await TODOBASE.addCollections({
  todos: {
    schema: todoSchema,
  },
});
