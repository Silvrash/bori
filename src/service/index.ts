import cass from 'cassandra-driver';
import { Organisation } from 'types';
import { useQuery } from './queryBuilder';

/**
 * adds organisation
 * @param  {cass.Client} client - cassandra client
 * @param  {Organisation} org - instance of the organisation
 * @param  {string|undefined=undefined} parentId - id of parent
 */
export const addOrganisation = async (
	client: cass.Client,
	org: Organisation,
	parentId: string | undefined | null = undefined
) => {
	let hierarchypath;

	/**
	 * if parent id exists, get grandparents of the parent
	 * and add the parent to the hierarchy tree and update
	 * the child's ancestor tree
	 */
	if (parentId) {
		const parent = await getOrganisation(client, parentId);
		if (parent!.hierarchypath) hierarchypath = [...(parent!.hierarchypath || []), parent!.id];
		else hierarchypath = [parent!.id];
	}
	org.date_added = new Date();
	await useQuery(client, 'add-org', [org.id, org.name, org.date_added, hierarchypath]);
	return org;
};

/**
 * get singular organisation
 * @param  {cass.Client} client - cassandra client
 * @param  {string} id - organisation id
 * @returns Promise
 */
export const getOrganisation = async (
	client: cass.Client,
	id: string
): Promise<Organisation | null> => {
	const result = await useQuery(client, 'get-org', [id]);
	if (!result || result.length === 0) return null;
	return result[0];
};

/**
 * get parents and grandparents of an organisation
 * @param  {cass.Client} client - cassandra client
 * @param  {string} orgId - organisation id
 */
export const getParents = async (client: cass.Client, orgId: string) => {
	const org = await getOrganisation(client, orgId);
	if (!org || !org.hierarchypath) return null;
	const parents = await useQuery(client, 'get-orgs', org.hierarchypath);
	return parents;
};
