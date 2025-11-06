"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabase = createDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
const sql_js_1 = __importDefault(require("sql.js"));
const pg_1 = require("pg");
const config_1 = require("../config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PostgreSQLDatabase {
    constructor() {
        this.pool = new pg_1.Pool({
            host: config_1.config.database.postgres.host,
            port: config_1.config.database.postgres.port,
            database: config_1.config.database.postgres.database,
            user: config_1.config.database.postgres.user,
            password: config_1.config.database.postgres.password,
        });
    }
    async query(sql, params = []) {
        const result = await this.pool.query(sql, params);
        return result.rows;
    }
    async execute(sql, params = []) {
        await this.pool.query(sql, params);
    }
    async get(sql, params = []) {
        const result = await this.pool.query(sql, params);
        return result.rows[0] || null;
    }
    async close() {
        await this.pool.end();
    }
}
class SQLiteDatabase {
    constructor(dbPath) {
        this.db = null;
        this.initialized = false;
        this.dbPath = dbPath;
    }
    async init() {
        if (this.initialized)
            return;
        this.SQL = await (0, sql_js_1.default)();
        const dbDir = path_1.default.dirname(this.dbPath);
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir, { recursive: true });
        }
        if (fs_1.default.existsSync(this.dbPath)) {
            const buffer = fs_1.default.readFileSync(this.dbPath);
            this.db = new this.SQL.Database(buffer);
        }
        else {
            this.db = new this.SQL.Database();
        }
        this.initialized = true;
    }
    async save() {
        if (!this.db)
            return;
        const data = this.db.export();
        fs_1.default.writeFileSync(this.dbPath, data);
    }
    async query(sql, params = []) {
        await this.init();
        if (!this.db)
            return [];
        try {
            const results = this.db.exec(sql, params);
            if (results.length === 0)
                return [];
            const columns = results[0].columns;
            const values = results[0].values;
            return values.map((row) => {
                const obj = {};
                columns.forEach((col, idx) => {
                    obj[col] = row[idx];
                });
                return obj;
            });
        }
        catch (error) {
            console.error('Query error:', error);
            return [];
        }
    }
    async execute(sql, params = []) {
        await this.init();
        if (!this.db)
            return;
        try {
            this.db.run(sql, params);
            await this.save();
        }
        catch (error) {
            console.error('Execute error:', error);
            throw error;
        }
    }
    async get(sql, params = []) {
        const results = await this.query(sql, params);
        return results[0] || null;
    }
    async close() {
        if (this.db) {
            await this.save();
            this.db.close();
            this.db = null;
            this.initialized = false;
        }
    }
}
let dbInstance = null;
function createDatabase() {
    if (config_1.config.database.type === 'postgresql') {
        return new PostgreSQLDatabase();
    }
    else {
        return new SQLiteDatabase(config_1.config.database.sqlite.path);
    }
}
function getDatabase() {
    if (!dbInstance) {
        dbInstance = createDatabase();
    }
    return dbInstance;
}
async function closeDatabase() {
    if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
    }
}
