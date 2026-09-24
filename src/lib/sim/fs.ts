// A tiny in-memory, Windows-flavoured file system.
export type FileNode = { type: 'file'; name: string; content: string };
export type DirNode = { type: 'dir'; name: string; children: Map<string, Node>; hidden?: boolean };
export type Node = FileNode | DirNode;

export const ROOT_LABEL = 'C:';

export function dir(name: string, kids: Node[] = [], hidden = false): DirNode {
	const children = new Map<string, Node>();
	for (const k of kids) children.set(k.name.toLowerCase(), k);
	return { type: 'dir', name, children, hidden };
}
export function file(name: string, content = ''): FileNode {
	return { type: 'file', name, content };
}

export function clone(n: Node): Node {
	if (n.type === 'file') return { ...n };
	return { type: 'dir', name: n.name, hidden: n.hidden, children: new Map([...n.children].map(([k, v]) => [k, clone(v)])) };
}

/** Split a user-typed path into segments. Returns absolute flag. */
export function splitPath(p: string): { abs: boolean; parts: string[] } {
	let s = p.trim().replace(/^["']|["']$/g, '');
	let abs = false;
	if (/^[a-z]:[\\/]?/i.test(s)) {
		abs = true;
		s = s.replace(/^[a-z]:[\\/]?/i, '');
	} else if (s.startsWith('/') || s.startsWith('\\')) {
		abs = true;
		s = s.slice(1);
	}
	const parts = s.split(/[\\/]+/).filter((x) => x.length > 0);
	return { abs, parts };
}

/** Resolve a path against cwd into absolute segments, handling . and .. */
export function resolve(cwd: string[], p: string, home: string[]): string[] {
	const t = p.trim();
	if (t === '~' || t === '$HOME' || t === '$home') return [...home];
	let rest = t;
	let base = cwd;
	const homeMatch = t.match(/^(~|\$home)[\\/](.*)$/i);
	if (homeMatch) {
		base = home;
		rest = homeMatch[2];
	}
	const { abs, parts } = splitPath(rest);
	const out = abs ? [] : [...base];
	for (const part of parts) {
		if (part === '.') continue;
		if (part === '..') {
			out.pop();
			continue;
		}
		out.push(part);
	}
	return out;
}

export function show(segs: string[]): string {
	return ROOT_LABEL + '\\' + segs.join('\\');
}

export function getNode(root: DirNode, segs: string[]): Node | null {
	let cur: Node = root;
	for (const s of segs) {
		if (cur.type !== 'dir') return null;
		const next: Node | undefined = cur.children.get(s.toLowerCase());
		if (!next) return null;
		cur = next;
	}
	return cur;
}

/** Real-cased names for a resolved path. */
export function canonical(root: DirNode, segs: string[]): string[] {
	const out: string[] = [];
	let cur: Node = root;
	for (const s of segs) {
		if (cur.type !== 'dir') return segs;
		const next = cur.children.get(s.toLowerCase());
		if (!next) return [...out, ...segs.slice(out.length)];
		out.push(next.name);
		cur = next;
	}
	return out;
}

export function parentAndName(segs: string[]): { parent: string[]; name: string } {
	return { parent: segs.slice(0, -1), name: segs[segs.length - 1] ?? '' };
}

/** Walk every file under a directory, returning paths relative to it. */
export function walkFiles(d: DirNode, prefix: string[] = []): { path: string[]; node: FileNode }[] {
	const out: { path: string[]; node: FileNode }[] = [];
	for (const n of d.children.values()) {
		if (n.type === 'file') out.push({ path: [...prefix, n.name], node: n });
		else out.push(...walkFiles(n, [...prefix, n.name]));
	}
	return out;
}
