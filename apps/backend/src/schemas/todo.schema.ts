export const createTodoSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

export const updateTodoSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    completed: { type: 'boolean' },
  },
  additionalProperties: false,
};
