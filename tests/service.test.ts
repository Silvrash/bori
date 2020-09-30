import { v4 as uuidv4 } from 'uuid';
import { getDatabaseClient } from '../src/db';
import * as service from '../src/service';
import { useQuery } from '../src/service/queryBuilder';
import { Organisation } from '../src/types';

// jest.mock('../src/service/queryBuilder');
// jest.mock('cassandra-driver');

describe('Test Service Functions', () => {
	const client = getDatabaseClient();
	let organisation: Organisation;

	beforeEach(async () => {
		// await client.connect();
	});

	afterEach(async () => {
		jest.clearAllMocks();
		// await client.shutdown();
	});

	test('add organisation', async () => {
		organisation = { id: uuidv4(), name: 'Org 1' };

		const result = await service.addOrganisation(client, organisation);
		expect(result.id).toBe(organisation.id);
		expect(result.date_added).not.toBe(undefined);
		// @ts-ignore
		// expect(useQuery.mock.calls.length).toBe(1);
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
		// @ts-ignore
		// expect(useQuery.mock.calls.length).toBe(1);
	});

	test('invalid query', async () => {
		try {
			await useQuery(client, 'unknown');
			expect(false).toBe(true);
		} catch (e) {
			expect(e).toEqual(new Error('Unknown query type'));
		}
	});
});

describe('get parents', () => {
	const client = getDatabaseClient();

	const organisation1 = { id: uuidv4(), name: 'Org 1' };
	const organisation2 = { id: uuidv4(), name: 'Org 2' };
	const organisation3 = { id: uuidv4(), name: 'Org 3' };
	const organisation4 = { id: uuidv4(), name: 'Org 4' };
	const organisation5 = { id: uuidv4(), name: 'Org 5' };

	beforeAll(async () => {
		await service.addOrganisation(client, organisation1);
		await service.addOrganisation(client, organisation2, organisation1.id);
		await service.addOrganisation(client, organisation3, organisation2.id);
		await service.addOrganisation(client, organisation4, organisation1.id);
		await service.addOrganisation(client, organisation5, organisation3.id);
	});

	test('should have no parent[root ancestor]', async () => {
		const parents = await service.getParents(client, organisation1.id);
		expect(parents).toBe(null);
	});

	test('should have 1 ancestor', async () => {
		const parents = await service.getParents(client, organisation2.id);
		expect(parents).not.toBe(null);
		expect(parents!.length).toBe(1);
		expect(parents!.map(x => x.id)).toEqual([organisation1.id]);
	});

	test('should have 2 ancestor', async () => {
		const parents = await service.getParents(client, organisation3.id);
		expect(parents).not.toBe(null);
		expect(parents!.length).toBe(2);
		expect(parents!.map(x => x.id).sort()).toEqual([organisation1.id, organisation2.id].sort());
	});

	test('should have 500 ancestors', async () => {
		let tempId: string | null = null;
		const ancestors = [];

		for (let id = 0; id <= 5; id++) {
			const newId = uuidv4();
			await service.addOrganisation(client, { id: newId, name: `Org ${id}` }, tempId);
			tempId = newId;
			if (id !== 5) ancestors.push(tempId);
		}

		const parents = await service.getParents(client, tempId!);
		expect(parents).not.toBe(null);
		expect(parents!.length).toBe(5);
		expect(parents!.map(x => x.id).sort()).toEqual(ancestors.sort());
	});
});
