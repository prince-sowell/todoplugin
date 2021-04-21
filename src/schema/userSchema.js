const schema = {
  title: "User schema",
  version: 0,
  description: "describes a simple user",
  type: "object",
  properties: {
    id: {
      type: "string",
      primary: true,
    },
    name: {
      type: "string",
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
  required: ["id", "name"],
  indexes: ["created_at"],
};

export default schema;
