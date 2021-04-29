# plugin Todo

## Plugin d'integration de la replication GraphQl d'RxDB avec quasar V2, et Hasura. 

### Install the dependencies

```bash
yarn
```

### fonctionements

- plugin RxDB:
  - installation des plugins necessaire pour le functionement d'RxDB si celle ci n'est pas encore installer

## les methods du plugin d'RxDB

### 1. createDb ()

- Création de la base de donnée local
  - prend deux parametres:
    - nom de la base qui suit les règles d'RxDB: **https://rxdb.info/rx-database.html#name**
    - Schema pour la creation de la collection, format json comme dans l'exemple ci-dessous:
      `const schema = { nonColection: { schemaColection } }`

### 2. getDB ()

- Retourn la base de donnée créer

### 3. getCollection ()

- Prend un parametres, le nom de la collection
- retourne la collection s'il exist, null le cas contraire

### 4. initTodoReplication ()

- Prend 7 parametres:
  - SECRET: token de la connexion de Hasura.
  - URLWEBSOCKET: End-point du canal subscription GraphQl d'Hasura.
  - SYNCURL: End-point GraphQl d'Hasura.
  - query: Query pour la methode subscription d'RxDB format: `const query = 'subscription { todo { id } }'`,
    **PS: il faut utiliser un backtick a la place de l'apostrophe https://fr.wiktionary.org/wiki/backtick#en**
  - pushQueryBuilder: Method de pushQueryBuilder d'RxDB. **https://rxdb.info/replication-graphql.html**
  - pullQueryBuilder: Method de pullQueryBuilder d'RxDB, voir le lien ci-dessous
  - nameColletion: Nom de la collection pour la replication
