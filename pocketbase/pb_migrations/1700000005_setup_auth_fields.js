/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('_pb_users_auth_');

    // Update existing name field (already present in PocketBase default auth collection)
    const nameField = collection.schema.getFieldByName('name');
    if (nameField) {
      nameField.required = true;
      nameField.options = { min: 1, max: 100, pattern: '' };
    } else {
      collection.schema.addField(
        new SchemaField({
          name: 'name',
          type: 'text',
          required: true,
          options: { min: 1, max: 100, pattern: '' },
        }),
      );
    }

    // Update existing avatar field (already present in PocketBase default auth collection)
    const avatarField = collection.schema.getFieldByName('avatar');
    if (avatarField) {
      avatarField.required = false;
      avatarField.options = {
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        thumbs: ['100x100', '200x200', '500x500'],
        protected: false,
      };
    } else {
      collection.schema.addField(
        new SchemaField({
          name: 'avatar',
          type: 'file',
          required: false,
          options: {
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            thumbs: ['100x100', '200x200', '500x500'],
            protected: false,
          },
        }),
      );
    }

    return dao.saveCollection(collection);
  },
  (db) => {
    // Revert: restore name and avatar fields to their default (unrestricted) options
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId('_pb_users_auth_');

    const nameField = collection.schema.getFieldByName('name');
    if (nameField) {
      nameField.required = false;
      nameField.options = { min: null, max: null, pattern: '' };
    }

    const avatarField = collection.schema.getFieldByName('avatar');
    if (avatarField) {
      avatarField.options = {
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: [
          'image/jpeg',
          'image/png',
          'image/svg+xml',
          'image/gif',
          'image/webp',
        ],
        thumbs: null,
        protected: false,
      };
    }

    return dao.saveCollection(collection);
  },
);
