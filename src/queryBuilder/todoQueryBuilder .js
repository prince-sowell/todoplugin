export const todoPullQueryBuilder = (doc) => {
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
                limit: 5
                ) {
                  id
                  text
                  isCompleted
                  deleted
                  created_at
                  updated_at
                  user_id
                }
              }`;
  return {
    query,
    variables: {},
  };
};

export const todoPushQueryBuilder = (doc) => {
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
