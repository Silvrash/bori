import { inQuery } from '../db';

/**
 * builds the query
 */
export const useQuery = inQuery((type, params) => {
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
                WHERE id IN (${params!.map(_ => '?').join(',')})`;
			break;
		default:
			throw new Error('Unknown query type');
	}

	return query;
});
