export const userPullQueryBuilder = (doc) => {
  if (!doc) {
    doc = {
      id: "",
      updated_at: new Date(0).toUTCString(),
    };
  }
  const query = `
                query UserQuery {
                  users(where: {
                    _or: 
                      {updated_at: {_gt: "${doc.updated_at}"}}
                    
                  }, 
                  limit: 5
                 ) {
                    id
                    name
                    deleted
                    created_at
                    updated_at
                  }
                }
                `;
  return {
    query,
    variables: {},
  };
};

export const userPushQueryBuilder = (doc) => {
  const query = `
              mutation createUsesr($user: [users_insert_input!]!) {
                insert_users(objects: $user, on_conflict: {constraint: users_pkey, update_columns: [name, updated_at, deleted]}) {
                  returning {
                    id
                  }
                }
              }
              `;
  const variables = {
    user: doc,
  };
  return {
    query,
    variables,
  };
};
