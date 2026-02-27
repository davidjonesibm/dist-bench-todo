/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const collection = new Collection({
      id: 'tags_collection',
      name: 'tags',
      type: 'base',
      system: false,
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true,
          options: {
            min: 1,
            max: 50,
          },
        },
        {
          name: 'color',
          type: 'text',
          required: true,
          options: {
            min: 4,
            max: 9,
            pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
          },
        },
        {
          name: 'userId',
          type: 'relation',
          required: true,
          options: {
            collectionId: '_pb_users_auth_',
            cascadeDelete: true,
            minSelect: null,
            maxSelect: 1,
            displayFields: [],
          },
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_tags_user_name ON tags (userId, name)',
      ],
      listRule: 'userId = @request.auth.id',
      viewRule: 'userId = @request.auth.id',
      createRule: 'userId = @request.auth.id',
      updateRule: 'userId = @request.auth.id',
      deleteRule: 'userId = @request.auth.id',
    });

    return Dao(db).saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('tags');
    return dao.deleteCollection(collection);
  },
);
