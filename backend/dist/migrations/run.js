"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _001_initial_schema_1 = require("./001_initial_schema");
const _002_security_schema_1 = require("./002_security_schema");
async function runMigrations() {
    try {
        console.log('Running database migrations...');
        await (0, _001_initial_schema_1.up)();
        await (0, _002_security_schema_1.up)();
        console.log('Migrations completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
runMigrations();
