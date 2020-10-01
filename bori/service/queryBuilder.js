"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuery = void 0;
const db_1 = require("../db");
/**
 * builds the query
 */
exports.useQuery = db_1.inQuery((type, params) => {
    let query = '';
    switch (type) {
        case 'add-org':
            query = `
                INSERT INTO organization (id, name, date_added, hierarchypath)
                VALUES (?, ?, ?, ?)`;
            break;
        case 'get-org':
            query = `
                SELECT id, name, date_added, hierarchypath
                FROM organization
                WHERE id=?`;
            break;
        case 'get-orgs':
            query = `
                SELECT id, name, date_added, hierarchypath
                FROM organization
                WHERE id IN (${params.map(_ => '?').join(',')})`;
            break;
        default:
            throw new Error('Unknown query type');
    }
    return query;
});
