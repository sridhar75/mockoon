const Migrations = require('@mockoon/commons').Migrations;
const { readFileSync, writeFileSync } = require('fs');
const prettier = require('prettier');
const prettierConfig = require('../package.json').prettier;
const glob = require('glob');

/**
 * Use this script to migrate the tests sample environments. See ../test/data/README.md for more information.
 */

glob(
  './test-new/data/mock-envs/*.json',
  './test-new/data/mock-envs/@(environment*|*v2|*v3).json',
  {
    ignore: [
      // TODO
      './test-new/data/mock-envs/incompatible.json',
      './test-new/data/mock-envs/migration.json',
      './test-new/data/mock-envs/schema-broken.json',
      './test-new/data/mock-envs/schema-broken-repair.json',
      './test-new/data/mock-envs/schema-uuid-dedup-1.json',
      './test-new/data/mock-envs/schema-uuid-dedup-2.json',
      './test-new/data/res/import-openapi/references/@(*v2|*v3).json',
      // TBR
      './test/data/import/new/**/*',
      './test/data/migrations/**/*',
      './test/data/schema-validation/**/*'
    ]
  },
  (error, files) => {
    files.forEach((file) => {
      const environment = JSON.parse(readFileSync(file).toString());

      console.log(`Starting migrating ${file}`);

      Migrations.forEach((migration) => {
        if (migration.id > environment.lastMigration) {
          migration.migrationFunction(environment);
          environment.lastMigration = migration.id;
        }
      });

      writeFileSync(
        file,
        prettier.format(
          JSON.stringify(environment),
          Object.assign(prettierConfig, {
            parser: 'json'
          })
        )
      );

      console.log(`Finished migrating ${file}`);
    });
  }
);
