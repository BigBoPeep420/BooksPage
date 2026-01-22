class DBI{
    dbName;
    storeName;
    version;
    db = null;

    constructor(dbName, storeName, version = 1){
        if(!dbName || !storeName){
            console.error('DBI needs a DB Name and Store Name');
            return;
        };
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;

        const req = indexedDB.open(this.dbName, this.version);
        req.onerror = e => {

        }
        req.onupgradeneeded = e => {
            this.db = e.target.result;
            const store = this.db.createObjectStore(this.storeName, 
                { }
            )
        }
        req.onsuccess = e => {

        }

        
    }
}