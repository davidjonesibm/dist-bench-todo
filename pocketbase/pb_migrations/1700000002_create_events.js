/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const collection = new Collection({
      id: 'events_collection',
      name: 'events',
      type: 'base',
      system: false,
      schema: [
        {
          name: 'title',
          type: 'text',
          required: true,
          options: {
            min: 1,
            max: 200,
          },
        },
        {
          name: 'description',
          type: 'editor',
          required: false,
          options: {},
        },
        {
          name: 'start',
          type: 'date',
          required: true,
          options: {},
        },
        {
          name: 'end',
          type: 'date',
          required: true,
          options: {},
        },
        {
          name: 'isAllDay',
          type: 'bool',
          required: false,
          options: {},
        },
        {
          name: 'color',
          type: 'text',
          required: false,
          options: {
            min: null,
            max: null,
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
        {
          name: 'tags',
          type: 'relation',
          required: false,
          options: {
            collectionId: 'tags_collection',
            cascadeDelete: false,
            minSelect: null,
            maxSelect: null,
            displayFields: [],
          },
        },
      ],
      indexes: [
        'CREATE INDEX idx_events_user_start ON events (userId, start)',
        'CREATE INDEX idx_events_user_end ON events (userId, end)',
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
    const collection = dao.findCollectionByNameOrId('events');
    return dao.deleteCollection(collection);
  },
);
