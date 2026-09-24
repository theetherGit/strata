<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import Terminal from '$lib/components/Terminal.svelte';
	import FileTree from '$lib/components/FileTree.svelte';
	import MissionList from '$lib/components/MissionList.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { Shell } from '$lib/sim/shell';
	import { dir, file, getNode } from '$lib/sim/fs';
	import TerminalActions from '$lib/components/TerminalActions.svelte';
	import { loadDrive, saveDrive, clearDrive } from '$lib/sim/drive.svelte';

	const N = 4;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	const make = () =>
		new Shell({
			root: dir('', [dir('Users', [dir('Neha', [dir('Desktop'), dir('Documents', [dir('learning'), file('thesis.docx', '(a Word file)')]), dir('Downloads', [file('field_photos.zip', '(compressed)')])])])]),
			cwd: ['Users', 'Neha']
		});
	const restored = loadDrive(4);
	let shell = $state(restored ?? make());
	let tick = $state(0);
	let attempts = $state(0);
	const greeting = restored ? 'Welcome back. Your pretend drive is as you left it. Type help for commands; Tab completes names.' : 'Practice PowerShell. Nothing here touches your real files. Type help for commands; Tab completes names.';
	const lab = ['Users', 'Neha', 'Documents', 'learning', 'lab4'];
	const at = (p: string[]) => shell.cwd.length === p.length && p.every((x, i) => x.toLowerCase() === shell.cwd[i].toLowerCase());
	const has = (name: string) => !!getNode(shell.root, [...lab, name]);

	function onrun(cmd: string) {
		tick++;
		const before = progress.playCount(chapter);
		const c = cmd.toLowerCase();
		if (/^(pwd|get-location)$/.test(c)) progress.markPlay(N, 'pwd');
		if (/^(ls|dir|gci|get-childitem)\b/.test(c)) progress.markPlay(N, 'ls');
		if (at(['Users', 'Neha', 'Documents', 'learning'])) {
			progress.markPlay(N, 'learning');
			if (progress.get(N).play.lab4) progress.markPlay(N, 'up');
		}
		if (at(lab)) progress.markPlay(N, 'lab4');
		if (has('a.txt') && has('b.txt') && has('c.txt')) progress.markPlay(N, 'files');
		if (/^(cat|type|get-content)\s+.*b\.txt/.test(c) && (getNode(shell.root, [...lab, 'b.txt']) as { content?: string } | null)?.content) progress.markPlay(N, 'cat');
		if (has('sediment.txt') && !has('c.txt') && has('a.txt')) progress.markPlay(N, 'mv');
		attempts = progress.playCount(chapter) > before ? 0 : attempts + 1;
		saveDrive(N, shell);
	}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
		<Terminal {shell} {onrun} {greeting} />
		<p class="text-muted-foreground text-sm">Stuck? Commands are in Chapter 4’s table. <code>cd ..</code> goes up; <code>echo basalt &gt; a.txt</code> makes a file; <code>&gt;&gt;</code> adds a line to one.</p>
		<TerminalActions onrestart={() => { shell = shell.restart(); tick++; saveDrive(N, shell); }} onreset={() => { clearDrive(N); shell = make(); tick++; attempts = 0; }} />
	</div>
	<div class="grid content-start gap-4">
		<MissionList {chapter} {attempts} />
		<div class="bg-card rounded-lg border-[1.5px] p-3">
			<h3 class="mb-1 font-serif text-lg font-semibold">What File Explorer would show</h3>
			{#key tick}<FileTree root={shell.root} cwd={shell.cwd} start={['Users', 'Neha']} {tick} />{/key}
		</div>
	</div>
</div>
