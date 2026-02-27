/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('notes');

    const contentField = collection.schema.getFieldByName('content');
    contentField.required = false;

    dao.saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('notes');

    const contentField = collection.schema.getFieldByName('content');
    contentField.required = true;

    dao.saveCollection(collection);
  },
);
