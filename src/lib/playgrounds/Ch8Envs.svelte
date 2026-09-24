<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import Terminal from '$lib/components/Terminal.svelte';
	import MissionList from '$lib/components/MissionList.svelte';
	import Shelves from '$lib/components/Shelves.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { Shell, makePython, type Line } from '$lib/sim/shell';
	import { dir, getNode } from '$lib/sim/fs';
	import TerminalActions from '$lib/components/TerminalActions.svelte';
	import { loadDrive, saveDrive, clearDrive } from '$lib/sim/drive.svelte';

	const N = 8;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	const LAB = ['Users', 'Neha', 'Documents', 'learning', 'lab8'];
	const make = () =>
		new Shell({
			root: dir('', [dir('Users', [dir('Neha', [dir('Documents', [dir('learning', [dir('lab8')])])])])]),
			cwd: LAB,
			pythons: { main: makePython('Python 3.12.6', '3.12', 'C:\\Users\\Neha\\AppData\\Local\\Programs\\Python\\Python312', ['pip', 'pandas', 'numpy', 'python-dateutil', 'pytz', 'tzdata', 'six', 'matplotlib']) },
			pythonCmd: 'main',
			execPolicyRestricted: true
		});
	const restored = loadDrive(8);
	let shell = $state(restored ?? make());
	let tick = $state(0);
	let attempts = $state(0);
	let sawPolicy = !!restored && !restored.execPolicyRestricted;
	function onrun(cmd: string, out: Line[]) {
		tick++;
		const before = progress.playCount(chapter);
		const c = cmd.toLowerCase();
		if (shell.venvs.size) progress.markPlay(N, 'make');
		if (out.some((l) => l.text.includes('running scripts is disabled'))) sawPolicy = true;
		if (sawPolicy && /^set-executionpolicy/.test(c)) progress.markPlay(N, 'policy');
		if (shell.activeVenv) progress.markPlay(N, 'act');
		if (shell.activeVenv && c.includes('import pandas') && out.some((l) => l.text.includes("No module named 'pandas'"))) progress.markPlay(N, 'empty');
		const v = shell.activeVenv ? shell.venvs.get(shell.activeVenv) : [...shell.venvs.values()][0];
		if (v?.packages.has('requests')) progress.markPlay(N, 'inst');
		const req = getNode(shell.root, [...LAB, 'requirements.txt']);
		if (req && req.type === 'file' && req.content.includes('requests==')) progress.markPlay(N, 'freeze');
		if (c === 'deactivate' && !shell.activeVenv && progress.get(N).play.act) progress.markPlay(N, 'deact');
		attempts = progress.playCount(chapter) > before ? 0 : attempts + 1;
		saveDrive(N, shell);
	}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
		<div class="bg-card rounded-lg border-[1.5px] p-3 text-sm">
			Start with <code>python -m venv .venv</code>, then <code>.venv\Scripts\activate</code>. When Windows refuses, fix it with <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> and activate again.
		</div>
		<Terminal {shell} {onrun} greeting={restored ? 'Welcome back. Your pretend laptop is as you left it.' : 'Practice PowerShell. Your main Python already has pandas; the new environment will not.'} />
		<TerminalActions onrestart={() => { shell = shell.restart(); tick++; saveDrive(N, shell); }} onreset={() => { clearDrive(N); shell = make(); tick++; sawPolicy = false; attempts = 0; }} />
	</div>
	<div class="grid content-start gap-4">
		<MissionList {chapter} {attempts} />
		{#key shell}<Shelves {shell} {tick} />{/key}
	</div>
</div>
