const schema = {
    title: "Todo schema",
    version: 0,
    description: "describes a simple Todo",
    type: "object",
    properties: {
      id: {
        type: "string",
        primary: true,
      },
      user_id: {
        type: "string",
      },
      text: {
        type: "string",
      },
      isCompleted: {
        type: "boolean",
      },
      created_at: {
        type: "string",
        format: "date-time",
      },
      updated_at: {
        type: "string",
        format: "date-time",
      },
    },
    required: ["text", "isCompleted", "id", "user_id"],
    indexes: ["created_at"],
  };
  
  export default schema;
  