import { readdir, readFile } from 'fs/promises';

console.log(
	[
		...new Set(
			(
				await Promise.all(
					(await readdir(`_site`, { withFileTypes: true, recursive: true }))
						.filter(dirent => dirent.isFile() && dirent.name.endsWith(`.html`))
						.map(async dirent => [...`${await readFile(`${dirent.path}/${dirent.name}`)}`.matchAll(/[^ ]+(?=docs)/g)].map(([match]) => match))
				)
			)
				.flat()
		)
	]
		.sort()
);

process.exit();