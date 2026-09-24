<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import Terminal from '$lib/components/Terminal.svelte';
	import MissionList from '$lib/components/MissionList.svelte';
	import Shelves from '$lib/components/Shelves.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { Shell, makePython, type Line } from '$lib/sim/shell';
	import { dir } from '$lib/sim/fs';
	import TerminalActions from '$lib/components/TerminalActions.svelte';
	import { loadDrive, saveDrive, clearDrive } from '$lib/sim/drive.svelte';

	const N = 7;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	const make = () =>
		new Shell({
			root: dir('', [dir('Users', [dir('Neha', [dir('Documents', [dir('learning')])])]), dir('Python310')]),
			cwd: ['Users', 'Neha', 'Documents', 'learning'],
			pythons: {
				new: makePython('Python 3.12.6', '3.12', 'C:\\Users\\Neha\\AppData\\Local\\Programs\\Python\\Python312'),
				old: makePython('Python 3.10.11', '3.10', 'C:\\Python310')
			},
			pythonCmd: 'new',
			pipCmd: 'old'
		});
	const restored = loadDrive(7);
	let shell = $state(restored ?? make());
	let tick = $state(0);
	let attempts = $state(0);
	function onrun(cmd: string, out: Line[]) {
		tick++;
		const before = progress.playCount(chapter);
		const c = cmd.toLowerCase();
		const failed = out.some((l) => l.text.includes("No module named 'pandas'"));
		if (/^python3?\s/.test(c) && c.includes('import pandas')) {
			if (failed) {
				progress.markPlay(N, 'fail');
				if (progress.get(N).play.pip) progress.markPlay(N, 'still');
			} else if (shell.pythons.new.packages.has('pandas')) progress.markPlay(N, 'fix');
		}
		if (/^pip3?\s+install\b.*pandas/.test(c) && out.some((l) => l.kind === 'ok' || l.text.includes('already satisfied'))) progress.markPlay(N, 'pip');
		if (/^pip3?\s+(--version|-v)\b/.test(c)) progress.markPlay(N, 'which');
		attempts = progress.playCount(chapter) > before ? 0 : attempts + 1;
		saveDrive(N, shell);
	}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
		<div class="bg-card rounded-lg border-[1.5px] p-3 text-sm">
			Try, in order: <code>python -c "import pandas"</code>, <code>pip install pandas</code>, the import again, <code>pip --version</code>, then <code>python -m pip install pandas</code>.
		</div>
		<Terminal {shell} {onrun} greeting={restored ? 'Welcome back. Your pretend laptop is as you left it.' : 'Practice PowerShell on a laptop with two Pythons. Watch the shelves as you install.'} />
		<TerminalActions onrestart={() => { shell = shell.restart(); tick++; saveDrive(N, shell); }} onreset={() => { clearDrive(N); shell = make(); tick++; attempts = 0; }} />
	</div>
	<div class="grid content-start gap-4">
		<MissionList {chapter} {attempts} />
		{#key shell}<Shelves {shell} {tick} />{/key}
	</div>
</div>
