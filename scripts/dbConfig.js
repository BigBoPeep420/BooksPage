import { DBI } from "./modules/dbi.module.js"

const CONFIG = {
    DB_NAME: 'DigitalDustJackets',
    DB_VERSION: '4',
    STORES: ['preferences', 'books'],
    INDEXES: {
        'books': [{name: 'title', keyPath: 'title', options: {unique: false}},
            { name: 'author', keyPath: 'author', options: {unique: false}},
            { name: 'isbn', keyPath: 'isbn', options: {unique: true}},]
    }
};

export const dbi = new DBI(CONFIG.DB_NAME, CONFIG.DB_VERSION, CONFIG.STORES, CONFIG.INDEXES)