import { DBI } from "./modules/dbi.module.js"

const CONFIG = {
    DB_NAME: 'DigitalDustJackets',
    DB_VERSION: '7',
    STORES: ['preferences', 'books'],
    KEYPATHS: {'preferences': ['key', false]},  // Format: {'storeName1': ['keyName', autoIncrement],}
    INDEXES: {
        'books': [{name: 'title', keyPath: 'title', options: {unique: false}},
            { name: 'author', keyPath: 'author', options: {unique: false}},
            { name: 'isbn', keyPath: 'isbn', options: {unique: true}},]
    }
};

export const dbi = new DBI(CONFIG.DB_NAME, CONFIG.DB_VERSION, CONFIG.STORES, CONFIG.KEYPATHS, CONFIG.INDEXES)