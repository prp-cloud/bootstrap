import { readdir, readFile } from 'fs/promises';

const matches = await Promise.all(
	(await readdir(`_site`, { withFileTypes: true, recursive: true }))
		.filter(dirent => dirent.isFile() && dirent.name.endsWith(`.html`))
		.map(async dirent =>
			[...`${await readFile(`${dirent.path}/${dirent.name}`)}`.matchAll(/[^ ]+(?=docs)/g)]
		)
);
console.log(matches);

process.exit();