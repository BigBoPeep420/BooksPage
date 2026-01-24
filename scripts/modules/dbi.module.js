export class DBI{
    dbName;
    stores;
    version;
    keyPaths;
    indexes;
    db = null;

    constructor(dbName, version, stores, keyPaths, indexes){
        this.dbName = dbName;
        this.stores = stores;
        this.version = version;
        this.keyPaths = keyPaths;
        this.indexes = indexes;
    }
    
    async open(){
        if(this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(new Error(`Database Error: ${request.error}`));
            };
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            request.onupgradeneeded = () => {
                const db = request.result;
                this.stores.forEach(v => {
                    if(db.objectStoreNames.contains(v)){
                        db.deleteObjectStore(v);
                    }
                    if(!db.objectStoreNames.contains(v)){
                        let keyPathToCreate = 'id';
                        let autoInc = true;
                        if(v in this.keyPaths){
                            keyPathToCreate = this.keyPaths[v][0];
                            autoInc = this.keyPaths[v][1];
                        }
                        const store = db.createObjectStore(v, 
                            { keyPath: keyPathToCreate, autoIncrement: autoInc }
                        );

                        if(v in this.indexes){
                            this.indexes[v].forEach(ind => {
                                store.createIndex(ind.name, ind.keyPath, ind.options || {});
                            });
                        };
                    }
                });
            };
        });
    }

    async #ensureOpen(){
        if(!this.db) await this.open();
    }

    async add(storeName, item){
        await this.#ensureOpen();
        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(storeName, 'readwrite');
            const store = trans.objectStore(storeName);
            const req = store.add(item);

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Error(`Failed to add [Item: ${item}:${typeof item}] to ` +
                `[Store: ${storeName}:${typeof storeName}] : [Reason: ${req.error}]`));
        });
    }

    async put(storeName, item){
        await this.#ensureOpen();
        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(storeName, 'readwrite');
            const store = trans.objectStore(storeName);
            const req = store.put(item);

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Error(`Failed to put [Item: ${item}:${typeof item}] in ` +
                `[Store: ${storeName}:${typeof storeName}] : [Reason: ${req.error}]`));
        });
    }

    async get(storeName, key){
        await this.#ensureOpen();

        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(storeName, 'readonly');
            const store = trans.objectStore(storeName);
            const req = store.get(key);

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Error(`Failed to get item: [Key: ${key}:${typeof key}] from ` + 
                `[Store: ${storeName}:${typeof storeName}] : [Reason: ${req.error}]`));
        });
    }

    async getAll(storeName){
        await this.#ensureOpen();
        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(storeName, 'readonly');
            const store = trans.objectStore(storeName);
            const req = store.getAll();

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Error(`Failed to get all items: [Store: ${this.storeName}] from ` +
                `[Store: ${storeName}:${typeof storeName}] : [Reason: ${req.error}]`));
        });
    }

    async getKeyByIndex(storeName, indexName, query){
        await this.#ensureOpen();
        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(storeName, 'readonly');
            const store = trans.objectStore(storeName);
            
            if(!store.indexNames.contains(indexName)){
                reject(new Error(`[Index: ${indexName}] does not exist in [${storeName}]`));
                return;
            }
            const index = store.index(indexName);
            const req = index.getKey(query)

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Error(`Failed to find primary key for [Query: ${query}:${typeof query}] in ` + 
                `[Store: ${storeName}] with [Index: ${indexName}]`
            ));
        })
    }

    async delete(storeName, key){
        await this.#ensureOpen();
        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(storeName, 'readwrite');
            const store = trans.objectStore(storeName);
            const req = store.delete(key);

            req.onsuccess = () => resolve();
            req.onerror = () => reject(new Error(`Failed to delete [Key: ${key}:${typeof key}] from ` +
                `[Store: ${storeName}:${typeof storeName}] : [Reason: ${req.error}]`));
        });
    }

    async clear(storeName){
        await this.#ensureOpen();
        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(storeName, 'readwrite');
            const store = trans.objectStore(storeName);
            const req = store.clear();

            req.onsuccess = () => resolve();
            req.onerror = () => reject(new Error(`Failed to clear [Store: ${storeName}:${typeof storeName}] : ` +
                `[Reason: ${req.error}]`));
        });
    }

    async count(storeName){
        await this.#ensureOpen();
        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(storeName, 'readonly');
            const store = trans.objectStore(storeName);
            const req = store.count();

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Error(`Failed to count items in [Store: ${storeName}:${typeof storeName}] : ` + 
                `[Reason: ${req.error}]`));
        })
    }

    async queryByIndex(storeName, indexName, query){
        await this.#ensureOpen();
        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(storeName, 'readonly');
            const store = trans.objectStore(storeName);

            if(!store.indexNames.contains(indexName)){
                reject(new Error(`[Index: ${indexName}] does not exist in [${storeName}]`));
                return;
            }
            const index = store.index(indexName);
            const req = index.getAll(query);

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Error(`Failed to query [Item: ${query}] with [Index: ${indexName}] ` + 
                `in [Store: ${storeName}] : [Reason: ${req.error}]`));
        });
    }

    async cursor(storeName, callback, mode = 'readonly'){
        await this.#ensureOpen();
        return new Promise((resolve, reject) => {
            const trans = this.db.transaction(storeName, mode);
            const store = trans.objectStore(storeName);
            const req = store.openCursor();

            req.onsuccess = e => {
                const cursor = e.target.result;
                if(cursor){
                    callback(cursor);
                    cursor.continue();
                } else resolve();
            };
            req.onerror = () => reject(new Error(`Cursor operation failed on [Store: ${storeName}] : ` +
                `[Reason: ${req.error}]`));
        });
    }

    close(){
        if(this.db){
            this.db.close();
            this.db = null;
        }
    }
}