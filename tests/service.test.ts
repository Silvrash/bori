import { v4 as uuidv4 } from 'uuid';
import * as db from '../src/db';
import * as service from '../src/service';
import * as queries from '../src/service/queryBuilder';
import { Organisation } from '../src/types';

describe('Test Service Functions', () => {
	jest.spyOn(db, 'getDatabaseClient').mockImplementation(
		() =>
			({
				execute: () => ({ rows: [{}] })
			} as any)
	);

	const client = db.getDatabaseClient();
	let organisation: Organisation;
	afterEach(async () => {
		jest.clearAllMocks();
	});

	test('add organisation', async () => {
		organisation = { id: uuidv4(), name: 'Org 1' };

		const result = await service.addOrganisation(client, organisation);
		expect(result.id).toBe(organisation.id);
		expect(result.date_added).not.toBe(undefined);
	});

	test('get organisation', async () => {
		const org = service.getOrganisation(client, organisation.id);
		expect(org).not.toBe(null);
	});

	test('add organisation with parent', async () => {
		const org = { id: uuidv4(), name: 'Org 2' };
		const result = await service.addOrganisation(client, org, organisation.id);
		expect(result.id).toBe(org.id);
		expect(result.date_added).not.toBe(undefined);
	});

	test('invalid query', async () => {
		try {
			await queries.useQuery(client, 'unknown');
			expect(false).toBe(true);
		} catch (e) {
			expect(e).toEqual(new Error('Unknown query type'));
		}
	});
});

describe('get parents', () => {
	const client = db.getDatabaseClient();

	const organisation1 = { id: uuidv4(), name: 'Org 1' };
	const organisation2 = { id: uuidv4(), name: 'Org 2' };
	const organisation3 = { id: uuidv4(), name: 'Org 3' };
	

	afterEach(async () => {
		jest.restoreAllMocks();
		// await client.shutdown();
	});

	test('should have no parent[root ancestor]', async () => {
		const parents = await service.getParents(client, organisation1.id);
		expect(parents).toBe(null);
	});

	test('should have 1 ancestor', async () => {
		const spy1 = jest.spyOn(service, 'getOrganisation').mockImplementation(async () => ({
			...organisation2,
			hierarchypath: [organisation1.id]
		}));
		const spy2 = jest
			.spyOn(queries, 'useQuery')
			.mockImplementation(() => [organisation1] as any);

		const parents = await service.getParents(client, organisation2.id);
		expect(parents).not.toBe(null);
		expect(parents!.length).toBe(1);
		expect(parents!.map(x => x.id)).toEqual([organisation1.id]);
		expect(spy1).toHaveBeenCalledTimes(1);
		expect(spy2).toHaveBeenCalledTimes(1);
	});

	test('should have 2 ancestor', async () => {
		const spy1 = jest.spyOn(service, 'getOrganisation').mockImplementation(async () => ({
			...organisation3,
			hierarchypath: [organisation1.id, organisation2.id]
		}));
		const spy2 = jest.spyOn(queries, 'useQuery').mockImplementation(async () => [
			organisation1,
			organisation2
		]);
		const parents = await service.getParents(client, organisation3.id);
		expect(parents).not.toBe(null);
		expect(parents!.length).toBe(2);
		expect(parents!.map(x => x.id).sort()).toEqual([organisation1.id, organisation2.id].sort());
		expect(spy1).toHaveBeenCalledTimes(1);
		expect(spy2).toHaveBeenCalledTimes(1);
	});
});
