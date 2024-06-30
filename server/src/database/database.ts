import {promises as fs, existsSync, writeFile, readFileSync, writeFileSync} from "fs";

class Database {
    private dbPath = process.env.DB_PATH || "";
    private db: any;

    constructor() {
        this.createDbFileIfNotExists();
        this.init();
    }

    private createDbFileIfNotExists() {
        const dbFileExists = existsSync(this.dbPath);
        if (!dbFileExists) {
            try {
                writeFileSync(this.dbPath, "{}");
                console.info("[DATABASE] File created successfuly");
            } catch (err) {
                throw new Error("[DATABASE] Could not create db file");
            }
            return;
        }

        console.info("[DATABASE] File already exists");
    }

    private init() {
       this.db = this.getDBAsObject();
    }

    private getDBAsObject() {
        try {
            const data = readFileSync(this.dbPath, {encoding: "utf8", flag: "r"});

            return JSON.parse(data);
        } catch(err: any) {
            throw new Error(`[DATABASE] Failed to read database file.\n${err.message}`);
        }

    }

    private async save() {
        try {
            console.log("[DATABASE] Persisting database", JSON.stringify(this.db));
            fs.writeFile(this.dbPath, JSON.stringify(this.db));
        } catch (err: any) {
            throw new Error(`[DATABASE] Could not persist database\n${err.message}`);
        }
    }

    async getAll() {
        try {
            return structuredClone(this.db);
        } catch (err) {
            throw new Error(`[DATABASE] Could not get all entries`);
        }
    }

    async getByKey(key: string) {
        try {
            if (this.db[key] == undefined) {
                throw new Error("[DATABASE] Key not found");
            }

            return this.db[key];
        } catch (err: any) {
            throw new Error(err.message);
        }
    }

    async insert(key: string, value: string | number) {
        try {
            this.db[key] = value;
            this.save();
        } catch (err: any) {
            throw new Error(`[DATABASE] Could not insert value ${value} with key ${key}\n${err.message}`);
        }
    }

    async update(key: string, newValue: string | number) {
        try {
            if (this.db[key] == undefined) {
                throw new Error("[DATABASE] Key not Found");
            }

            this.db[key] = newValue;
            this.save();
        } catch (err: any) {
            throw new Error(err.message);
        }
    }

    async remove(key: string) {
        try {
            delete this.db[key];
            this.save();
        } catch (err: any) {
            throw new Error(err.message);
        }
    }
}

export default Database;