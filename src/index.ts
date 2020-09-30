import chalk from 'chalk';
import program from 'commander';
import figlet from 'figlet';
import { Organisation } from 'types';
import { v4 as uuidv4 } from 'uuid';
import { getDatabaseClient } from './db';
import * as service from './service';

console.log(chalk.green(figlet.textSync('backend test', { horizontalLayout: 'full' })));

const main = async () => {
	program
		.version('0.0.1')
		.description('A cli application for blue ocean robotics test')
		.option('-a, --add <string>', 'add an organisation')
		.option('-f, --find <string>', 'find organisation by id')
		.option('-p, --parentId <string>', 'set parent id: use together with --add`')
		.parse(process.argv);

	const db = getDatabaseClient();
	await db.connect();

	if (program.add) {
		const organisation: Organisation = {
			name: program.add,
			id: uuidv4(),
			date_added: new Date()
		};
		const parentId = program.parentId;
		const result = await service.addOrganisation(db, organisation, parentId);
		console.log(result);
	} else if (program.find) {
		const result = await service.getParents(db, program.find);
		console.log(result.map(org => org.name).join(', '));
	} else {
		program.outputHelp();
	}

	await db.shutdown();
};

main().catch(e => {
	console.log(e);
	process.exit();
});
