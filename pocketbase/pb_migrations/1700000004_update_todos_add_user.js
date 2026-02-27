/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('todos');

    // Delete all existing todos (test data only)
    db.newQuery('DELETE FROM todos').execute();

    // Add userId field
    collection.schema.addField(
      new SchemaField({
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
      }),
    );

    // Update collection rules
    collection.listRule = 'userId = @request.auth.id';
    collection.viewRule = 'userId = @request.auth.id';
    collection.createRule = 'userId = @request.auth.id';
    collection.updateRule = 'userId = @request.auth.id';
    collection.deleteRule = 'userId = @request.auth.id';

    // Add index
    collection.indexes = [
      'CREATE INDEX idx_todos_user_completed_created ON todos (userId, completed, created)',
    ];

    return dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('todos');

    // Remove userId field
    collection.schema.removeField(
      collection.schema.getFieldByName('userId').id,
    );

    // Revert to original rules (open access)
    collection.listRule = '';
    collection.viewRule = '';
    collection.createRule = '';
    collection.updateRule = '';
    collection.deleteRule = '';

    // Remove indexes
    collection.indexes = [];

    return dao.saveCollection(collection);
  },
);
