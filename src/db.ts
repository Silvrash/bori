import cass from 'cassandra-driver';

// tslint:disable-next-line: no-var-requires
require('dotenv').config(); // load .env environment vars

/**
 * get a client instance of the database
 */
export const getDatabaseClient = () => {
	return new cass.Client({
		contactPoints: process.env.CASSANDRA_CLUSTERS!.split(','),
		localDataCenter: 'datacenter1',
		keyspace: 'bori'
	});
};

/**
 * Execute prepared query
 *
 * Prepared statements are parsed and prepared on the Cassandra nodes
 * and are ready for future execution.
 * Also, when preparing, the driver retrieves information about
 * the parameter types which allows an accurate mapping
 * between a JavaScript type and a Cassandra type.
 * @param  {cass.Client} client - cassandra client instance
 * @param  {string} preparedQuery - query string
 * @param  {Array<string|number|boolean>} params? - query parameters
 */
export const runPreparedQuery = (
	client: cass.Client,
	preparedQuery: string,
	params?: Array<string | number | boolean>
): any => {
	return client.execute(preparedQuery, params, { prepare: true });
};

/**
 * Higher order function which executes a query string
 * within the scope of the cassandra database
 * @param  {(type:string,params?:any[])=>string} queryBuilder
 */
export const inQuery = (queryBuilder: (type: string, params?: any[]) => string) => {
	return async (client: cass.Client, type: string, params?: any[]): Promise<any[]> => {
		const result = await runPreparedQuery(client, queryBuilder(type, params), params);
		return result.rows;
	};
};
