/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const collection = new Collection({
      id: 'todos_collection',
      name: 'todos',
      type: 'base',
      system: false,
      schema: [
        {
          name: 'title',
          type: 'text',
          required: true,
          options: {
            min: 1,
            max: 500,
          },
        },
        {
          name: 'completed',
          type: 'bool',
          required: false,
          options: {},
        },
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });

    return Dao(db).saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('todos');
    return dao.deleteCollection(collection);
  },
);
