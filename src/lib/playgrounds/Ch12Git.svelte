<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import Terminal from '$lib/components/Terminal.svelte';
	import MissionList from '$lib/components/MissionList.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { Shell, type Line } from '$lib/sim/shell';
	import { dir, file, getNode } from '$lib/sim/fs';
	import { FileText, Inbox, History } from '@lucide/svelte';
	import TerminalActions from '$lib/components/TerminalActions.svelte';
	import { loadDrive, saveDrive, clearDrive } from '$lib/sim/drive.svelte';

	const N = 12;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	const HERE = ['Users', 'Neha', 'Documents', 'learning', 'fieldnotes'];
	const make = () =>
		new Shell({
			root: dir('', [dir('Users', [dir('Neha', [dir('Documents', [dir('learning', [dir('fieldnotes', [file('notes.txt', 'Sample NH-01: basalt\n'), dir('.venv', [dir('Scripts', [file('python.exe', ''), file('activate', '')]), file('pyvenv.cfg', 'version = 3.12.6\n')])])])])])])]),
			cwd: HERE,
			gitInstalled: true
		});
	const restored = loadDrive(12);
	let shell = $state(restored ?? make());
	let tick = $state(0);
	let attempts = $state(0);

	const view = $derived.by(() => {
		tick;
		const repo = shell.findRepo();
		if (!repo) return null;
		const a = shell.gitAreas(repo);
		const staged = new Set(a.staged.map((s) => s.path));
		const unstaged = new Map(a.unstaged.map((s) => [s.path, s.state]));
		const files = [...a.work.keys()].sort().map((p) => ({ p, state: a.untracked.includes(p) ? (staged.has(p) ? 'staged' : 'untracked') : unstaged.get(p) ?? (staged.has(p) ? 'staged' : 'clean') }));
		return { files, staged: a.staged, commits: [...repo.commits].reverse() };
	});

	function onrun(cmd: string, _out: Line[]) {
		tick++;
		const before = progress.playCount(chapter);
		const repo = shell.findRepo();
		if (shell.gitUser.name && shell.gitUser.email) progress.markPlay(N, 'who');
		if (repo) progress.markPlay(N, 'init');
		if (repo && repo.commits.length >= 1 && repo.commits[0].snapshot.has('notes.txt')) progress.markPlay(N, 'c1');
		if (repo && repo.commits.length >= 2) {
			const a = repo.commits[0].snapshot.get('notes.txt');
			if (repo.commits.slice(1).some((c) => c.snapshot.get('notes.txt') !== a)) progress.markPlay(N, 'c2');
		}
		const gi = getNode(shell.root, [...HERE, '.gitignore']);
		if (repo && gi && gi.type === 'file' && /\.venv/.test(gi.content) && ![...shell.working(repo).keys()].some((k) => k.startsWith('.venv/'))) progress.markPlay(N, 'ignore');
		if (/^git\s+log\s+--oneline/i.test(cmd) && repo?.commits.length) progress.markPlay(N, 'log');
		attempts = progress.playCount(chapter) > before ? 0 : attempts + 1;
		saveDrive(N, shell);
	}
	const tone = (s: string) => (s === 'clean' ? 'outline' : s === 'staged' ? 'malachite' : s === 'untracked' ? 'hematite' : 'ochre') as 'outline' | 'malachite' | 'hematite' | 'ochre';
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
		<div class="bg-card rounded-lg border-[1.5px] p-3 text-sm">
			Git is already installed on this pretend laptop. To change a file here, append a line: <code>echo "Sample NH-02: granite" &gt;&gt; notes.txt</code>. To create the ignore file: <code>echo .venv/ &gt; .gitignore</code>.
		</div>
		<Terminal {shell} {onrun} greeting={restored ? 'Welcome back. Your fieldnotes folder is as you left it.' : 'Practice PowerShell in the fieldnotes folder. Start with git status, or tell Git who you are.'} />
		<div class="grid gap-3 md:grid-cols-3">
			<section class="bg-card rounded-lg border-[1.5px] p-3">
				<h3 class="mb-2 flex items-center gap-2 text-sm font-semibold"><FileText class="size-4" /> Working folder</h3>
				{#if view}
					<ul class="grid gap-1.5 text-sm">
						{#each view.files as f (f.p)}<li class="flex items-center justify-between gap-2"><span class="truncate font-mono text-xs">{f.p}</span><Badge variant={tone(f.state)}>{f.state}</Badge></li>{:else}<li class="text-muted-foreground">No files</li>{/each}
					</ul>
				{:else}<p class="text-muted-foreground text-sm">Not a repository yet. Run <code>git init</code>.</p>{/if}
			</section>
			<section class="bg-card rounded-lg border-[1.5px] p-3">
				<h3 class="mb-2 flex items-center gap-2 text-sm font-semibold"><Inbox class="size-4" /> Staging tray</h3>
				{#if view?.staged.length}
					<ul class="grid gap-1.5 text-sm">{#each view.staged as s (s.path)}<li class="animate-in fade-in slide-in-from-left-2 flex items-center justify-between gap-2"><span class="truncate font-mono text-xs">{s.path}</span><Badge variant="malachite">{s.state}</Badge></li>{/each}</ul>
				{:else}<p class="text-muted-foreground text-sm">Empty. <code>git add</code> puts changes here.</p>{/if}
			</section>
			<section class="bg-card rounded-lg border-[1.5px] p-3">
				<h3 class="mb-2 flex items-center gap-2 text-sm font-semibold"><History class="size-4" /> History</h3>
				{#if view?.commits.length}
					<ol class="border-malachite grid gap-2 border-l-2 pl-3">
						{#each view.commits as c (c.hash)}<li class="animate-in fade-in slide-in-from-top-2 text-sm"><span class="text-muted-foreground font-mono text-xs">{c.hash}</span><div class="font-medium">{c.msg}</div><div class="text-muted-foreground text-xs">{c.files} file{c.files > 1 ? 's' : ''} · {c.author}</div></li>{/each}
					</ol>
				{:else}<p class="text-muted-foreground text-sm">No commits yet. <code>git commit -m "…"</code> saves the staging tray here.</p>{/if}
			</section>
		</div>
		<TerminalActions onrestart={() => { shell = shell.restart(); tick++; saveDrive(N, shell); }} onreset={() => { clearDrive(N); shell = make(); tick++; attempts = 0; }} />
	</div>
	<MissionList {chapter} {attempts} class="self-start max-lg:order-first lg:sticky lg:top-6" />
</div>
