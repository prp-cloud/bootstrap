import { readdir, readFile, writeFile } from 'fs/promises';

const recurse = async (dir: string) =>
	await Promise.all(
		(await readdir(dir, { withFileTypes: true }))
			.map(async dirent => {
				const path = `${dir}/${dirent.name}`;
				if (!dirent.isFile()) return recurse(path);
				if (!dirent.name.endsWith(`.html`)) return;
				const contents = `${await readFile(path)}`;
				const replaced = contents.replaceAll(`src="/docs`, `src="/bootstrap/docs`);
				if (contents != replaced) return writeFile(path, replaced);
			})
	);

await recurse(`../_site`)
process.exit();