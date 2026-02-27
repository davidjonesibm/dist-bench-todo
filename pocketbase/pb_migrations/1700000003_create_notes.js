/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const collection = new Collection({
      id: 'notes_collection',
      name: 'notes',
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
          name: 'content',
          type: 'text',
          required: true,
          options: {
            min: 0,
            max: 100000,
          },
        },
        {
          name: 'isPinned',
          type: 'bool',
          required: false,
          options: {},
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
        {
          name: 'attachments',
          type: 'file',
          required: false,
          options: {
            maxSelect: 5,
            maxSize: 10485760,
            mimeTypes: [],
            thumbs: [],
            protected: false,
          },
        },
      ],
      indexes: [
        'CREATE INDEX idx_notes_user_pinned_updated ON notes (userId, isPinned, updated)',
        'CREATE INDEX idx_notes_user_created ON notes (userId, created)',
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
    const collection = dao.findCollectionByNameOrId('notes');
    return dao.deleteCollection(collection);
  },
);
