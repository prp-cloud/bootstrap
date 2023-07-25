import { readdir, writeFile } from 'fs/promises';
import { JSDOM } from 'jsdom';

const now = Date.now();
const { entries } = Object;
const transforms = [
	...[`href`, `src`, `srcset`].map(attr => ({
		attr,
		fn: (val: string) =>
			val.startsWith(`data:`)
				? val
				: val.split(/,\s*/).map(src => (/^(?=\/docs|\/$)/.test(src) ? `/bootstrap` : ``) + src).join(`, `)
	})),
	{ attr: `onclick` },
	...entries({ LINK: `href`, SCRIPT: `src` }).map(([nodeName, attr]) => ({
		attr,
		fn: (val: string, node: Node & { rel?: string }) =>
			val +
			(nodeName == node.nodeName && !val.startsWith(`https://`) && node.rel != `canonical` ? `?${now}` : ``)
	}))
]
	.map(transform => ({ ...transform, results: <Record<string, number>>{} }));

const recurse = async (dir: string): Promise<unknown> =>
	Promise.all(
		(await readdir(dir, { withFileTypes: true })).map(async dirent => {
			const path = `${dir}/${dirent.name}`;
			if (!dirent.isFile()) return recurse(path);
			if (!dirent.name.endsWith(`.html`)) return;
			const jsdom = await JSDOM.fromFile(path);
			for (const node of jsdom.window.document.querySelectorAll(`*`))
				for (const { attr, results, ...transform } of transforms) {
					const val = node.getAttribute(attr);
					if (!val) continue;
					const transformed = `fn` in transform && transform.fn(val, node);
					if (transformed == val) continue;
					if (transformed) node.setAttribute(attr, transformed);
					else node.removeAttribute(attr);
					const key = `${val} => ${transformed}`;
					results[key] = (results[key] ?? 0) + 1;
				}
			return writeFile(path, jsdom.serialize());
		})
	);

await recurse(`_site`);

console.log( // eslint-disable-line no-console
	transforms.map(({ attr, results }) => ({
		attr,
		results: Object.fromEntries(entries(results).sort(([a], [b]) => a.localeCompare(b)))
	}))
);
process.exit();