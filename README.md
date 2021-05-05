# Plugin Replication Graphql d'RxDB

## Plugin d'integration de la replication GraphQl d'RxDB avec quasar V2, et Hasura.

### Install the dependencies

```bash
yarn
```

### fonctionements

- plugin RxDB:
  - installation des plugins necessaire pour le functionement d'RxDB si celle ci n'est pas encore installer

## les methods du plugin d'RxDB

### 1. initRxdb ()

- Prend 5 parametres:
  - SECRET: token de la connexion de Hasura.
  - URLWEBSOCKET: End-point du canal subscription GraphQl d'Hasura.
  - SYNCURL: End-point GraphQl d'Hasura.
  - querys: Un tableau qui regroup les query et queryBuilder pour le functionement de la replication d'RxDB, Le format du tableau est:
    ` querys["nomDeLaCollection"] = [ { pull: PullQueryBuilder de la collection }, { push: PushQueryBuilder de la collection }, { sub: subscriptionQuery de la collection },`
  - Schema: schema d'rxdb au forma suivant:
    - `const schma = {nomDeLaCollection: {schema RxDB clasic de la collection}}`

### 2. createDb ()

- Création de la base de donnée local
  - prend le nom de la base de donnée comme parametre

### 2. getDB ()

- Retourn la base de donnée créer

### 3. getCollection ()

- Prend le nom de la collection comme parametres
- retourne la collection s'il exist, null le cas contraire

### 4. initReplication ()

- initialise la replication de tous les collections existant crée
