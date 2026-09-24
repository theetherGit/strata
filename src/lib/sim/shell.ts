import {
	type DirNode,
	type FileNode,
	type Node,
	canonical,
	dir,
	file,
	getNode,
	parentAndName,
	resolve,
	show,
	walkFiles
} from './fs';

export type Line = { kind: 'cmd' | 'out' | 'err' | 'ok'; text: string; prompt?: string };

/* ------------------------------------------------------------------ */
/* Python model                                                        */
/* ------------------------------------------------------------------ */
export type Py = { label: string; short: string; home: string; packages: Map<string, string> };

const CATALOGUE: Record<string, { v: string; deps: string[] }> = {
	pandas: { v: '2.2.3', deps: ['numpy', 'python-dateutil', 'pytz', 'tzdata'] },
	numpy: { v: '2.1.1', deps: [] },
	'python-dateutil': { v: '2.9.0', deps: ['six'] },
	pytz: { v: '2024.2', deps: [] },
	tzdata: { v: '2024.2', deps: [] },
	six: { v: '1.16.0', deps: [] },
	requests: { v: '2.32.3', deps: ['certifi', 'charset-normalizer', 'idna', 'urllib3'] },
	certifi: { v: '2024.8.30', deps: [] },
	'charset-normalizer': { v: '3.3.2', deps: [] },
	idna: { v: '3.10', deps: [] },
	urllib3: { v: '2.2.3', deps: [] },
	matplotlib: { v: '3.9.2', deps: ['numpy', 'pillow', 'pyparsing', 'packaging', 'cycler', 'kiwisolver'] },
	pillow: { v: '10.4.0', deps: [] },
	pyparsing: { v: '3.1.4', deps: [] },
	packaging: { v: '24.1', deps: [] },
	cycler: { v: '0.12.1', deps: [] },
	kiwisolver: { v: '1.4.7', deps: [] },
	ipykernel: { v: '6.29.5', deps: ['packaging'] },
	geopandas: { v: '1.0.1', deps: ['pandas', 'numpy', 'packaging'] }
};
const STDLIB = new Set(['math', 'os', 'sys', 'csv', 'json', 'random', 'pathlib', 'platform', 'datetime', 'statistics', 'time']);
const IMPORT_NAME: Record<string, string> = { dateutil: 'python-dateutil', PIL: 'pillow' };

export function makePython(label: string, short: string, home: string, pkgs: string[] = ['pip']): Py {
	const packages = new Map<string, string>();
	for (const p of pkgs) packages.set(p, p === 'pip' ? '24.2' : (CATALOGUE[p]?.v ?? '1.0'));
	return { label, short, home, packages };
}

/* ------------------------------------------------------------------ */
/* Git model                                                           */
/* ------------------------------------------------------------------ */
type Snapshot = Map<string, string>;
export type Commit = { hash: string; msg: string; author: string; snapshot: Snapshot; files: number };
export type Repo = { root: string[]; staged: Map<string, string | null>; commits: Commit[] };

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */
export type ShellOptions = {
	root: DirNode;
	cwd: string[];
	home?: string[];
	pythons?: Record<string, Py>;
	pythonCmd?: string | null;
	pipCmd?: string | null;
	execPolicyRestricted?: boolean;
	gitInstalled?: boolean;
	user?: string;
};

function tokenize(input: string): string[] {
	const out: string[] = [];
	let cur = '';
	let quote: string | null = null;
	let had = false;
	for (let i = 0; i < input.length; i++) {
		const c = input[i];
		if (quote) {
			if (c === quote) quote = null;
			else cur += c;
			continue;
		}
		if (c === '"' || c === "'") {
			quote = c;
			had = true;
			continue;
		}
		if (c === '>' ) {
			if (cur || had) out.push(cur);
			cur = '';
			had = false;
			if (input[i + 1] === '>') {
				out.push('>>');
				i++;
			} else out.push('>');
			continue;
		}
		if (/\s/.test(c)) {
			if (cur || had) out.push(cur);
			cur = '';
			had = false;
			continue;
		}
		cur += c;
	}
	if (cur || had) out.push(cur);
	return out;
}

const hex = () => Math.random().toString(16).slice(2, 9).padEnd(7, '0');

export class Shell {
	root: DirNode;
	cwd: string[];
	home: string[];
	history: string[] = [];
	pythons: Record<string, Py>;
	pythonCmd: string | null;
	pipCmd: string | null;
	venvs = new Map<string, Py>();
	activeVenv: string | null = null;
	execPolicyRestricted: boolean;
	gitInstalled: boolean;
	gitUser: { name?: string; email?: string } = {};
	repos = new Map<string, Repo>();
	user: string;
	private startCwd: string[];
	get startCwdPublic() {
		return this.startCwd;
	}
	/** Log of every command run, with its output, for mission checks. */
	log: { cmd: string; out: Line[] }[] = [];

	constructor(o: ShellOptions) {
		this.root = o.root;
		this.cwd = o.cwd;
		this.startCwd = [...o.cwd];
		this.home = o.home ?? ['Users', 'Neha'];
		this.pythons = o.pythons ?? {};
		this.pythonCmd = o.pythonCmd ?? null;
		this.pipCmd = o.pipCmd ?? this.pythonCmd;
		this.execPolicyRestricted = o.execPolicyRestricted ?? false;
		this.gitInstalled = o.gitInstalled ?? false;
		this.user = o.user ?? 'Neha';
	}

	/** A new terminal window on the same computer: files, installed packages, environments and Git history stay; the working folder, command history and any active environment reset, just as when you close and reopen PowerShell. */
	restart(): Shell {
		const s = new Shell({ root: this.root, cwd: this.startCwd, home: this.home, pythons: this.pythons, pythonCmd: this.pythonCmd, pipCmd: this.pipCmd, execPolicyRestricted: this.execPolicyRestricted, gitInstalled: this.gitInstalled, user: this.user });
		s.venvs = this.venvs;
		s.repos = this.repos;
		s.gitUser = this.gitUser;
		return s;
	}
	prompt(): string {
		const venv = this.activeVenv ? `(${this.activeVenv.split('\\').pop()}) ` : '';
		return `${venv}PS ${show(canonical(this.root, this.cwd))}>`;
	}

	/* ---------- helpers ---------- */
	abs(p: string) {
		return resolve(this.cwd, p, this.home);
	}
	key(segs: string[]) {
		return show(canonical(this.root, segs)).toLowerCase();
	}
	private err(text: string): Line {
		return { kind: 'err', text };
	}
	private out(text: string): Line {
		return { kind: 'out', text };
	}
	private notFound(p: string, verb = 'find path'): Line {
		return this.err(`Cannot ${verb} '${show(this.abs(p))}' because it does not exist.`);
	}
	get py(): Py | null {
		if (this.activeVenv) return this.venvs.get(this.activeVenv) ?? null;
		return this.pythonCmd ? (this.pythons[this.pythonCmd] ?? null) : null;
	}
	get pip(): Py | null {
		if (this.activeVenv) return this.venvs.get(this.activeVenv) ?? null;
		return this.pipCmd ? (this.pythons[this.pipCmd] ?? null) : null;
	}
	private writeFile(p: string, text: string, append: boolean): Line[] {
		const segs = this.abs(p);
		const { parent, name } = parentAndName(segs);
		const pd = getNode(this.root, parent);
		if (!pd || pd.type !== 'dir') return [this.err(`Could not find a part of the path '${show(segs)}'.`)];
		const existing = pd.children.get(name.toLowerCase());
		if (existing && existing.type === 'dir') return [this.err(`Access to the path '${show(segs)}' is denied.`)];
		if (existing && existing.type === 'file') existing.content = append ? existing.content + text : text;
		else pd.children.set(name.toLowerCase(), file(name, text));
		return [];
	}

	/* ---------- main entry ---------- */
	run(input: string): Line[] {
		const trimmed = input.trim();
		const promptText = this.prompt();
		const lines: Line[] = [{ kind: 'cmd', text: input, prompt: promptText }];
		if (!trimmed) return lines;
		this.history.push(trimmed);
		let tokens = tokenize(trimmed);
		let redirect: { op: string; target: string } | null = null;
		const ri = tokens.findIndex((t) => t === '>' || t === '>>');
		if (ri >= 0) {
			redirect = { op: tokens[ri], target: tokens[ri + 1] ?? '' };
			tokens = tokens.slice(0, ri);
		}
		let result: Line[];
		try {
			result = this.dispatch(tokens, trimmed);
		} catch (e) {
			result = [this.err(String(e))];
		}
		if (redirect) {
			if (!redirect.target) result = [this.err('Missing file specification after redirection operator.')];
			else {
				const errs = result.filter((l) => l.kind === 'err');
				const text = result.filter((l) => l.kind !== 'err').map((l) => l.text).join('\n');
				result = [...errs, ...this.writeFile(redirect.target, text ? text + '\n' : '', redirect.op === '>>')];
			}
		}
		lines.push(...result);
		this.log.push({ cmd: trimmed, out: result });
		return lines;
	}

	private dispatch(t: string[], raw: string): Line[] {
		const [cmd0, ...args] = t;
		const cmd = cmd0.toLowerCase();

		// venv activation scripts
		if (/(^|[\\/])scripts[\\/]activate(\.ps1|\.bat)?$/i.test(cmd0) || (cmd === 'source' && /bin[\\/]activate$/i.test(args[0] ?? ''))) {
			return this.activate(cmd === 'source' ? args[0] : cmd0);
		}

		switch (cmd) {
			case 'help':
				return [
					this.out('Commands this practice terminal understands:'),
					this.out('  pwd  ls  cd  mkdir  echo  cat  cp  mv  rm  clear'),
					this.out('  python  pip  deactivate  git  Set-ExecutionPolicy'),
					this.out('Tip: press Tab to complete names, and the up arrow for earlier commands.')
				];
			case 'pwd':
			case 'get-location':
				return [this.out(show(canonical(this.root, this.cwd)))];
			case 'ls':
			case 'dir':
			case 'get-childitem':
			case 'gci':
				return this.ls(args.filter((a) => !a.startsWith('-'))[0], args.some((a) => /^-(force|a)$/i.test(a)));
			case 'cd':
			case 'set-location':
			case 'chdir':
				return this.cd(args[0] ?? '~');
			case 'mkdir':
			case 'md':
				return this.mkdir(args);
			case 'echo':
			case 'write-output':
				return [this.out(args.join(' '))];
			case 'cat':
			case 'type':
			case 'get-content':
				return this.cat(args[0]);
			case 'cp':
			case 'copy':
			case 'copy-item':
				return this.cpmv(args, false);
			case 'mv':
			case 'move':
			case 'move-item':
			case 'ren':
			case 'rename-item':
				return this.cpmv(args, true);
			case 'rm':
			case 'del':
			case 'remove-item':
				return this.rm(args);
			case 'clear':
			case 'cls':
				return [{ kind: 'ok', text: '__clear__' }];
			case 'python':
			case 'python3':
			case 'py':
				return this.python(args);
			case 'pip':
			case 'pip3':
				return this.pipCmdRun(args, this.pip, 'pip');
			case 'deactivate':
				if (!this.activeVenv) return [this.err("deactivate : The term 'deactivate' is not recognized. (No environment is active.)")];
				this.activeVenv = null;
				return [];
			case 'set-executionpolicy':
				this.execPolicyRestricted = false;
				return [];
			case 'git':
				return this.git(args);
			default:
				return [
					this.err(`${cmd0} : The term '${cmd0}' is not recognized as the name of a cmdlet, function, script file, or operable program.`),
					this.err('Check the spelling of the name, or if a path was included, verify that the path is correct and try again.')
				];
		}
	}

	/* ---------- file commands ---------- */
	private ls(p: string | undefined, force: boolean): Line[] {
		const segs = p ? this.abs(p) : this.cwd;
		const n = getNode(this.root, segs);
		if (!n) return [this.notFound(p ?? '.')];
		if (n.type === 'file') return [this.out(n.name)];
		const kids = [...n.children.values()].filter((k) => force || !(k.type === 'dir' && k.hidden));
		if (!kids.length) return [];
		kids.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
		return [
			this.out(`    Directory: ${show(canonical(this.root, segs))}`),
			this.out(''),
			this.out('Mode    Name'),
			this.out('----    ----'),
			...kids.map((k) => this.out(`${k.type === 'dir' ? 'd----' : '-a---'}   ${k.name}`))
		];
	}
	private cd(p: string): Line[] {
		const segs = this.abs(p);
		const n = getNode(this.root, segs);
		if (!n) return [this.notFound(p)];
		if (n.type !== 'dir') return [this.err(`Cannot find path '${show(segs)}' because it is a file, not a folder.`)];
		this.cwd = canonical(this.root, segs);
		return [];
	}
	private mkdir(args: string[]): Line[] {
		const names = args.filter((a) => !a.startsWith('-'));
		if (!names.length) return [this.err('mkdir: supply a folder name, for example: mkdir results')];
		const out: Line[] = [];
		for (const p of names) {
			const segs = this.abs(p);
			const { parent, name } = parentAndName(segs);
			const pd = getNode(this.root, parent);
			if (!pd || pd.type !== 'dir') {
				out.push(this.err(`Could not find a part of the path '${show(segs)}'.`));
				continue;
			}
			if (pd.children.has(name.toLowerCase())) {
				out.push(this.err(`An item with the specified name ${show(segs)} already exists.`));
				continue;
			}
			pd.children.set(name.toLowerCase(), dir(name));
			out.push(this.out(`    Directory created: ${name}`));
		}
		return out;
	}
	private cat(p?: string): Line[] {
		if (!p) return [this.err('cat: supply a file name, for example: cat notes.txt')];
		const n = getNode(this.root, this.abs(p));
		if (!n) return [this.notFound(p)];
		if (n.type === 'dir') return [this.err(`Unable to get content because it is a folder: '${show(this.abs(p))}'.`)];
		return n.content.replace(/\n$/, '').split('\n').map((l) => this.out(l));
	}
	private cpmv(args: string[], move: boolean): Line[] {
		const [a, b] = args.filter((x) => !x.startsWith('-'));
		if (!a || !b) return [this.err(`${move ? 'mv' : 'cp'}: supply a source and a destination, for example: ${move ? 'mv a.csv data' : 'cp a.csv b.csv'}`)];
		const src = this.abs(a);
		const sn = getNode(this.root, src);
		if (!sn) return [this.notFound(a)];
		let dst = this.abs(b);
		const dn = getNode(this.root, dst);
		if (dn && dn.type === 'dir') dst = [...dst, sn.name];
		const { parent, name } = parentAndName(dst);
		const pd = getNode(this.root, parent);
		if (!pd || pd.type !== 'dir') return [this.err(`Could not find a part of the path '${show(dst)}'.`)];
		const copy: Node = sn.type === 'file' ? file(name, sn.content) : { ...sn, name };
		pd.children.set(name.toLowerCase(), copy);
		if (move) {
			const { parent: sp, name: sname } = parentAndName(src);
			const spd = getNode(this.root, sp) as DirNode;
			if (!(sp.join('\\').toLowerCase() === parent.join('\\').toLowerCase() && sname.toLowerCase() === name.toLowerCase())) spd.children.delete(sname.toLowerCase());
		}
		return [];
	}
	private rm(args: string[]): Line[] {
		const recurse = args.some((a) => /^-(r|recurse|rf)$/i.test(a));
		const targets = args.filter((a) => !a.startsWith('-'));
		if (!targets.length) return [this.err('rm: supply what to delete, for example: rm old.csv')];
		const out: Line[] = [];
		for (const p of targets) {
			const segs = this.abs(p);
			const n = getNode(this.root, segs);
			if (!n) {
				out.push(this.notFound(p));
				continue;
			}
			if (n.type === 'dir' && n.children.size && !recurse) {
				out.push(this.err(`The item at ${show(segs)} has children. Use rm -r to delete a folder and everything in it.`));
				continue;
			}
			const { parent, name } = parentAndName(segs);
			(getNode(this.root, parent) as DirNode).children.delete(name.toLowerCase());
			if (this.cwd.join('\\').toLowerCase().startsWith(segs.join('\\').toLowerCase())) this.cwd = parent;
		}
		return out;
	}

	/* ---------- python ---------- */
	private noPython(name: string): Line[] {
		return [
			this.err(`${name} : The term '${name}' is not recognized as the name of a cmdlet, function, script file, or operable program.`),
			this.err('(The shell searched every folder on the PATH and found no program with this name.)')
		];
	}
	private python(args: string[]): Line[] {
		const py = this.py;
		if (!py) return this.noPython('python');
		if (!args.length)
			return [this.out(`${py.label} (practice terminal)`), this.out('The interactive >>> prompt only works in a real terminal. Try python -c "print(2 + 2)" here.')];
		const a0 = args[0];
		if (a0 === '--version' || a0 === '-V') return [this.out(py.label)];
		if (a0 === '-m') {
			const mod = args[1];
			if (mod === 'pip') return this.pipCmdRun(args.slice(2), py, 'python -m pip');
			if (mod === 'venv') return this.makeVenv(args[2]);
			if (mod === 'http.server') return [this.out('Serving HTTP on :: port 8000 (http://[::]:8000/) ...'), this.out('(In this practice terminal the server stops immediately. Try it on your own computer.)')];
			return this.runStatements(py, [`import ${mod}`], '<module>');
		}
		if (a0 === '-c') return this.runStatements(py, (args[1] ?? '').split(';'), '<string>');
		// run a script file
		const n = getNode(this.root, this.abs(a0));
		if (!n)
			return [this.err(`${py.home}\\python.exe: can't open file '${show(this.abs(a0))}': [Errno 2] No such file or directory`)];
		if (n.type === 'dir') return [this.err(`python.exe: can't find '__main__' module in '${show(this.abs(a0))}'`)];
		return this.runStatements(py, n.content.split('\n'), n.name);
	}
	private runStatements(py: Py, stmts: string[], where: string): Line[] {
		const out: Line[] = [];
		const imported = new Map<string, string>();
		let lineNo = 0;
		for (const rawStmt of stmts) {
			lineNo++;
			const s = rawStmt.trim();
			if (!s || s.startsWith('#')) continue;
			let m: RegExpMatchArray | null;
			if ((m = s.match(/^import\s+(.+)$/))) {
				for (const part of m[1].split(',')) {
					const [mod, , alias] = part.trim().split(/\s+/);
					const top = mod.split('.')[0];
					if (!this.hasModule(py, top)) return [...out, ...this.traceback(where, lineNo, s, `ModuleNotFoundError: No module named '${top}'`)];
					imported.set(alias ?? top, top);
				}
				continue;
			}
			if ((m = s.match(/^from\s+(\S+)\s+import\s+(.+)$/))) {
				const top = m[1].split('.')[0];
				if (!this.hasModule(py, top)) return [...out, ...this.traceback(where, lineNo, s, `ModuleNotFoundError: No module named '${top}'`)];
				continue;
			}
			if ((m = s.match(/^print\((.*)\)$/))) {
				const v = this.evalExpr(m[1], py, imported);
				if (v === undefined) {
					out.push(this.out('(This practice terminal only runs simple lines. Try this one on your own computer.)'));
					return out;
				}
				out.push(this.out(v));
				continue;
			}
			out.push(this.out('(This practice terminal only runs imports and simple print() lines. Run the full program on your own computer.)'));
			return out;
		}
		return out;
	}
	private traceback(where: string, line: number, code: string, last: string): Line[] {
		return [
			this.err('Traceback (most recent call last):'),
			this.err(`  File "${where}", line ${where === '<string>' ? 1 : line}, in <module>`),
			this.err(`    ${code}`),
			this.err(last)
		];
	}
	private hasModule(py: Py, mod: string) {
		if (STDLIB.has(mod)) return true;
		const pkg = IMPORT_NAME[mod] ?? mod;
		return py.packages.has(pkg);
	}
	private evalExpr(e: string, py: Py, imported: Map<string, string>): string | undefined {
		const s = e.trim();
		let m: RegExpMatchArray | null;
		if ((m = s.match(/^(["'])(.*)\1$/))) return m[2];
		if ((m = s.match(/^(\w+)\.__name__$/)) && imported.has(m[1])) return imported.get(m[1]);
		if ((m = s.match(/^(\w+)\.__version__$/)) && imported.has(m[1])) return py.packages.get(IMPORT_NAME[imported.get(m[1])!] ?? imported.get(m[1])!) ?? '1.0';
		if (s === 'sys.prefix' && imported.has('sys')) return this.activeVenv ? this.activeVenv.replace(/^c:/, 'C:') : py.home;
		if (s === 'sys.executable' && imported.has('sys')) return (this.activeVenv ?? py.home) + '\\python.exe';
		if (/^[\d\s+\-*/().]+$/.test(s)) {
			try {
				const v = Function(`"use strict"; return (${s});`)();
				if (typeof v === 'number' && isFinite(v)) {
					const isFloat = s.includes('/') || /\d\.\d/.test(s);
					return isFloat ? (Number.isInteger(v) ? v.toFixed(1) : String(v)) : String(v);
				}
			} catch {
				return undefined;
			}
		}
		return undefined;
	}

	/* ---------- pip ---------- */
	private pipCmdRun(args: string[], py: Py | null, invoked: string): Line[] {
		if (!py) return this.noPython('pip');
		const sub = (args[0] ?? '').toLowerCase();
		if (sub === '--version' || sub === '-v') return [this.out(`pip 24.2 from ${py.home}\\Lib\\site-packages\\pip (python ${py.short})`)];
		if (sub === 'install') {
			let names = args.slice(1).filter((a) => !a.startsWith('-'));
			const rIdx = args.indexOf('-r');
			if (rIdx >= 0) {
				const n = getNode(this.root, this.abs(args[rIdx + 1] ?? ''));
				if (!n || n.type !== 'file') return [this.err(`ERROR: Could not open requirements file: [Errno 2] No such file or directory: '${args[rIdx + 1] ?? ''}'`)];
				names = n.content.split('\n').map((l) => l.split('==')[0].trim()).filter(Boolean);
			}
			if (!names.length) return [this.err('ERROR: You must give at least one requirement to install (see "pip help install")')];
			const out: Line[] = [];
			const newly: string[] = [];
			const visit = (name: string, top: boolean) => {
				const key = name.toLowerCase();
				const c = CATALOGUE[key];
				if (!c) {
					out.push(this.err(`ERROR: Could not find a version that satisfies the requirement ${name} (from versions: none)`));
					out.push(this.err(`ERROR: No matching distribution found for ${name}`));
					return;
				}
				if (py.packages.has(key)) {
					if (top) out.push(this.out(`Requirement already satisfied: ${key} in ${py.home}\\Lib\\site-packages (${c.v})`));
					return;
				}
				out.push(this.out(`Collecting ${key}${top ? '' : ` (from ${names[0]})`}`));
				py.packages.set(key, c.v);
				newly.push(`${key}-${c.v}`);
				for (const d of c.deps) visit(d, false);
			};
			for (const n of names) visit(n, true);
			if (newly.length) {
				out.push(this.out(`Installing collected packages: ${newly.map((x) => x.replace(/-[\d.]+$/, '')).join(', ')}`));
				out.push({ kind: 'ok', text: `Successfully installed ${newly.join(' ')}` });
			}
			return out;
		}
		if (sub === 'list') {
			const rows = [...py.packages].sort(([a], [b]) => a.localeCompare(b));
			return [this.out('Package            Version'), this.out('------------------ ---------'), ...rows.map(([n, v]) => this.out(n.padEnd(19) + v))];
		}
		if (sub === 'freeze') {
			return [...py.packages].filter(([n]) => n !== 'pip').sort(([a], [b]) => a.localeCompare(b)).map(([n, v]) => this.out(`${n}==${v}`));
		}
		if (sub === 'show') {
			const name = (args[1] ?? '').toLowerCase();
			if (!py.packages.has(name)) return [this.err(`WARNING: Package(s) not found: ${args[1] ?? ''}`)];
			const c = CATALOGUE[name];
			return [
				this.out(`Name: ${name}`),
				this.out(`Version: ${py.packages.get(name)}`),
				this.out(`Location: ${py.home}\\Lib\\site-packages`),
				this.out(`Requires: ${(c?.deps ?? []).slice().sort().join(', ')}`)
			];
		}
		if (sub === 'uninstall') {
			const name = (args.find((a, i) => i > 0 && !a.startsWith('-')) ?? '').toLowerCase();
			if (!py.packages.has(name)) return [this.err(`WARNING: Skipping ${name} as it is not installed.`)];
			py.packages.delete(name);
			return [{ kind: 'ok', text: `Successfully uninstalled ${name}` }];
		}
		return [this.err(`ERROR: unknown command "${args[0] ?? ''}". Try: ${invoked} install <package>`)];
	}

	/* ---------- venv ---------- */
	private makeVenv(name?: string): Line[] {
		if (!name) return [this.err('usage: venv [-h] ENV_DIR')];
		const base = this.py;
		if (!base) return this.noPython('python');
		const segs = this.abs(name);
		const { parent, name: nm } = parentAndName(segs);
		const pd = getNode(this.root, parent);
		if (!pd || pd.type !== 'dir') return [this.err(`Could not find a part of the path '${show(segs)}'.`)];
		pd.children.set(
			nm.toLowerCase(),
			dir(nm, [dir('Scripts', [file('activate', ''), file('Activate.ps1', ''), file('python.exe', ''), file('pip.exe', '')]), dir('Lib', [dir('site-packages')]), file('pyvenv.cfg', `version = ${base.label.split(' ')[1]}\n`)])
		);
		const home = show(canonical(this.root, segs));
		this.venvs.set(home.toLowerCase(), makePython(base.label, base.short, home));
		return [];
	}
	private activate(p: string): Line[] {
		const segs = this.abs(p.replace(/^\.[\\/]/, ''));
		if (!getNode(this.root, segs)) return [this.err(`The term '${p}' is not recognized. Check that the environment exists in this folder (ls).`)];
		if (this.execPolicyRestricted)
			return [
				this.err(`${p} : File ${show(segs)}.ps1 cannot be loaded because running scripts is disabled on this system.`),
				this.err('For more information, see about_Execution_Policies.'),
				this.err('(Fix it once with: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned)')
			];
		const venvRoot = this.key(segs.slice(0, -2));
		if (!this.venvs.has(venvRoot)) return [this.err('This folder is not a virtual environment made in this terminal.')];
		this.activeVenv = venvRoot;
		return [];
	}

	/* ---------- git ---------- */
	findRepo(): Repo | null {
		for (let i = this.cwd.length; i >= 0; i--) {
			const r = this.repos.get(this.key(this.cwd.slice(0, i)));
			if (r) return r;
		}
		return null;
	}
	private ignored(repo: Repo): (rel: string) => boolean {
		const gi = getNode(this.root, [...repo.root, '.gitignore']);
		const pats = gi && gi.type === 'file' ? gi.content.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')) : [];
		return (rel: string) =>
			pats.some((p) => {
				const q = p.replace(/\\/g, '/');
				if (q.endsWith('/')) return rel.startsWith(q) || rel === q.slice(0, -1);
				if (q.startsWith('*.')) return rel.toLowerCase().endsWith(q.slice(1).toLowerCase());
				return rel === q || rel.split('/').includes(q);
			});
	}
	working(repo: Repo): Map<string, string> {
		const d = getNode(this.root, repo.root) as DirNode;
		const ign = this.ignored(repo);
		const out = new Map<string, string>();
		for (const { path, node } of walkFiles(d)) {
			const rel = path.join('/');
			if (rel.startsWith('.git/') || ign(rel)) continue;
			out.set(rel, node.content);
		}
		return out;
	}
	head(repo: Repo): Snapshot {
		return repo.commits.length ? repo.commits[repo.commits.length - 1].snapshot : new Map();
	}
	index(repo: Repo): Snapshot {
		const idx = new Map(this.head(repo));
		for (const [k, v] of repo.staged) v === null ? idx.delete(k) : idx.set(k, v);
		return idx;
	}
	private git(args: string[]): Line[] {
		if (!this.gitInstalled) return this.noPython('git');
		const sub = (args[0] ?? '').toLowerCase();
		if (sub === '--version' || sub === 'version') return [this.out('git version 2.46.0.windows.1')];
		if (sub === 'config') {
			const k = args.find((a) => /^user\.(name|email)$/i.test(a));
			const v = args[args.indexOf(k ?? '') + 1];
			if (!k) return [this.err('usage: git config --global user.name "Your Name"')];
			if (v === undefined) return [this.out((k.toLowerCase().endsWith('name') ? this.gitUser.name : this.gitUser.email) ?? '')];
			if (k.toLowerCase().endsWith('name')) this.gitUser.name = v;
			else this.gitUser.email = v;
			return [];
		}
		if (sub === 'init') {
			const k = this.key(this.cwd);
			const here = getNode(this.root, this.cwd) as DirNode;
			const existed = this.repos.has(k);
			if (!existed) {
				this.repos.set(k, { root: [...this.cwd], staged: new Map(), commits: [] });
				here.children.set('.git', dir('.git', [], true));
			}
			return [this.out(`${existed ? 'Reinitialized existing' : 'Initialized empty'} Git repository in ${show(canonical(this.root, this.cwd))}\\.git\\`)];
		}
		const repo = this.findRepo();
		if (!repo) return [this.err('fatal: not a git repository (or any of the parent directories): .git')];
		const rel = (p: string) => {
			const a = canonical(this.root, this.abs(p));
			return a.slice(repo.root.length).join('/');
		};
		if (sub === 'status') return this.gitStatus(repo);
		if (sub === 'add') {
			const targets = args.slice(1).filter((a) => !a.startsWith('-'));
			if (!targets.length) return [this.err('Nothing specified, nothing added.'), this.err("hint: Maybe you wanted to say 'git add .'?")];
			const work = this.working(repo);
			const ign = this.ignored(repo);
			const idx = this.index(repo);
			const out: Line[] = [];
			for (const t of targets) {
				const r = t === '.' || t === '-A' ? rel('.') : rel(t);
				const node = getNode(this.root, this.abs(t));
				if (!node && !idx.has(r)) {
					out.push(this.err(`fatal: pathspec '${t}' did not match any files`));
					continue;
				}
				if (node && node.type === 'file' && ign(r)) {
					out.push(this.err('The following paths are ignored by one of your .gitignore files:'), this.err(r));
					continue;
				}
				const prefix = r ? r + '/' : '';
				for (const [k, v] of work) if (!r || k === r || k.startsWith(prefix)) repo.staged.set(k, v);
				for (const k of idx.keys()) if ((!r || k === r || k.startsWith(prefix)) && !work.has(k)) repo.staged.set(k, null);
			}
			return out;
		}
		if (sub === 'commit') {
			const mi = args.findIndex((a) => a === '-m' || a === '-am');
			if (args[mi] === '-am') {
				const work = this.working(repo);
				for (const k of this.index(repo).keys()) repo.staged.set(k, work.get(k) ?? null);
			}
			const msg = mi >= 0 ? args[mi + 1] : undefined;
			if (!msg) return [this.err('Aborting commit: write a message with -m, for example: git commit -m "Add field notes"')];
			if (!this.gitUser.name || !this.gitUser.email)
				return [
					this.err('Author identity unknown'),
					this.err(''),
					this.err('*** Please tell me who you are.'),
					this.err('Run'),
					this.err('  git config --global user.email "you@example.com"'),
					this.err('  git config --global user.name "Your Name"')
				];
			const head = this.head(repo);
			const idx = this.index(repo);
			const changed = new Set([...idx.keys(), ...head.keys()].filter((k) => idx.get(k) !== head.get(k)));
			if (!changed.size) {
				const st = this.gitStatus(repo);
				return st;
			}
			const c: Commit = { hash: hex(), msg, author: this.gitUser.name, snapshot: idx, files: changed.size };
			repo.commits.push(c);
			repo.staged.clear();
			return [this.out(`[main${repo.commits.length === 1 ? ' (root-commit)' : ''} ${c.hash}] ${msg}`), this.out(` ${changed.size} file${changed.size === 1 ? '' : 's'} changed`)];
		}
		if (sub === 'log') {
			if (!repo.commits.length) return [this.err("fatal: your current branch 'main' does not have any commits yet")];
			const list = [...repo.commits].reverse();
			if (args.includes('--oneline')) return list.map((c, i) => this.out(`${c.hash} ${i === 0 ? '(HEAD -> main) ' : ''}${c.msg}`));
			return list.flatMap((c, i) => [this.out(`commit ${c.hash}${'0'.repeat(33)}${i === 0 ? ' (HEAD -> main)' : ''}`), this.out(`Author: ${c.author} <${this.gitUser.email}>`), this.out(''), this.out(`    ${c.msg}`), this.out('')]);
		}
		return [this.err(`git: '${args[0] ?? ''}' is not a git command in this practice terminal. Try: status, add, commit, log.`)];
	}
	gitAreas(repo: Repo) {
		const head = this.head(repo);
		const idx = this.index(repo);
		const work = this.working(repo);
		const staged: { path: string; state: string }[] = [];
		for (const k of new Set([...idx.keys(), ...head.keys()])) {
			if (idx.get(k) === head.get(k)) continue;
			staged.push({ path: k, state: !head.has(k) ? 'new file' : !idx.has(k) ? 'deleted' : 'modified' });
		}
		const unstaged: { path: string; state: string }[] = [];
		for (const k of idx.keys()) {
			if (!work.has(k)) unstaged.push({ path: k, state: 'deleted' });
			else if (work.get(k) !== idx.get(k)) unstaged.push({ path: k, state: 'modified' });
		}
		const untracked = [...work.keys()].filter((k) => !idx.has(k));
		return { staged, unstaged, untracked, work };
	}
	private gitStatus(repo: Repo): Line[] {
		const { staged, unstaged, untracked } = this.gitAreas(repo);
		const out: Line[] = [this.out('On branch main')];
		if (!repo.commits.length) out.push(this.out(''), this.out('No commits yet'));
		if (staged.length) {
			out.push(this.out(''), this.out('Changes to be committed:'));
			for (const s of staged) out.push({ kind: 'ok', text: `        ${(s.state + ':').padEnd(12)}${s.path}` });
		}
		if (unstaged.length) {
			out.push(this.out(''), this.out('Changes not staged for commit:'));
			for (const s of unstaged) out.push(this.err(`        ${(s.state + ':').padEnd(12)}${s.path}`));
		}
		if (untracked.length) {
			const shown = [...new Set(untracked.map((u) => (u.includes('/') ? u.split('/')[0] + '/' : u)))];
			out.push(this.out(''), this.out('Untracked files:'), this.out('  (use "git add <file>..." to include in what will be committed)'));
			for (const u of shown) out.push(this.err(`        ${u}`));
		}
		if (!staged.length && !unstaged.length && !untracked.length) {
			out.push(this.out(repo.commits.length ? 'nothing to commit, working tree clean' : 'nothing to commit (create/copy files and use "git add" to track)'));
		} else if (!staged.length) {
			out.push(this.out(''), this.out('no changes added to commit (use "git add")'));
		}
		return out;
	}

	/* ---------- tab completion ---------- */
	complete(input: string): string {
		const m = input.match(/^(.*?)([^\s"']*)$/);
		if (!m) return input;
		const [, before, partial] = m;
		const sep = Math.max(partial.lastIndexOf('\\'), partial.lastIndexOf('/'));
		const dirPart = sep >= 0 ? partial.slice(0, sep + 1) : '';
		const namePart = sep >= 0 ? partial.slice(sep + 1) : partial;
		const d = getNode(this.root, dirPart ? this.abs(dirPart) : this.cwd);
		if (!d || d.type !== 'dir') return input;
		const hits = [...d.children.values()].filter((c) => c.name.toLowerCase().startsWith(namePart.toLowerCase()) && !(c.type === 'dir' && c.hidden));
		if (hits.length !== 1) return input;
		const h = hits[0];
		return before + dirPart + h.name + (h.type === 'dir' ? '\\' : '');
	}
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */
type NodeJ = { t: 'f'; n: string; c: string } | { t: 'd'; n: string; h?: boolean; k: NodeJ[] };
function nodeToJ(n: Node): NodeJ {
	return n.type === 'file' ? { t: 'f', n: n.name, c: n.content } : { t: 'd', n: n.name, h: n.hidden, k: [...n.children.values()].map(nodeToJ) };
}
function nodeFromJ(j: NodeJ): Node {
	return j.t === 'f' ? file(j.n, j.c) : dir(j.n, j.k.map(nodeFromJ), j.h);
}
const pyToJ = (p: Py) => ({ label: p.label, short: p.short, home: p.home, packages: [...p.packages] });
const pyFromJ = (j: ReturnType<typeof pyToJ>): Py => ({ label: j.label, short: j.short, home: j.home, packages: new Map(j.packages) });

export type ShellJSON = ReturnType<Shell['toJSON']>;

declare module './shell' {
	interface Shell {
		toJSON(): {
			v: 1;
			root: NodeJ;
			cwd: string[];
			startCwd: string[];
			home: string[];
			history: string[];
			pythons: Record<string, ReturnType<typeof pyToJ>>;
			pythonCmd: string | null;
			pipCmd: string | null;
			venvs: [string, ReturnType<typeof pyToJ>][];
			activeVenv: string | null;
			execPolicyRestricted: boolean;
			gitInstalled: boolean;
			gitUser: { name?: string; email?: string };
			repos: [string, { root: string[]; staged: [string, string | null][]; commits: { hash: string; msg: string; author: string; files: number; snapshot: [string, string][] }[] }][];
			user: string;
		};
	}
}
Shell.prototype.toJSON = function (this: Shell) {
	return {
		v: 1 as const,
		root: nodeToJ(this.root),
		cwd: this.cwd,
		startCwd: this.startCwdPublic,
		home: this.home,
		history: this.history,
		pythons: Object.fromEntries(Object.entries(this.pythons).map(([k, p]) => [k, pyToJ(p)])),
		pythonCmd: this.pythonCmd,
		pipCmd: this.pipCmd,
		venvs: [...this.venvs].map(([k, p]) => [k, pyToJ(p)] as [string, ReturnType<typeof pyToJ>]),
		activeVenv: this.activeVenv,
		execPolicyRestricted: this.execPolicyRestricted,
		gitInstalled: this.gitInstalled,
		gitUser: this.gitUser,
		repos: [...this.repos].map(([k, r]) => [k, { root: r.root, staged: [...r.staged], commits: r.commits.map((c) => ({ hash: c.hash, msg: c.msg, author: c.author, files: c.files, snapshot: [...c.snapshot] })) }] as [string, { root: string[]; staged: [string, string | null][]; commits: { hash: string; msg: string; author: string; files: number; snapshot: [string, string][] }[] }]),
		user: this.user
	};
};

/** Rebuild a shell from toJSON() output. Returns null if the data is not usable. */
export function shellFromJSON(j: unknown): Shell | null {
	try {
		const d = j as ShellJSON;
		if (!d || d.v !== 1) return null;
		const root = nodeFromJ(d.root) as DirNode;
		const s = new Shell({ root, cwd: d.startCwd, home: d.home, pythons: Object.fromEntries(Object.entries(d.pythons).map(([k, p]) => [k, pyFromJ(p)])), pythonCmd: d.pythonCmd, pipCmd: d.pipCmd, execPolicyRestricted: d.execPolicyRestricted, gitInstalled: d.gitInstalled, user: d.user });
		s.cwd = d.cwd;
		s.history = d.history;
		s.venvs = new Map(d.venvs.map(([k, p]) => [k, pyFromJ(p)]));
		s.activeVenv = d.activeVenv;
		s.gitUser = d.gitUser;
		s.repos = new Map(d.repos.map(([k, r]) => [k, { root: r.root, staged: new Map(r.staged), commits: r.commits.map((c) => ({ ...c, snapshot: new Map(c.snapshot) })) }]));
		return s;
	} catch {
		return null;
	}
}

export type { DirNode, FileNode };
