<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import FileTree from '$lib/components/FileTree.svelte';
	import MissionList from '$lib/components/MissionList.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { dir, file, getNode, canonical, splitPath, show } from '$lib/sim/fs';
	import { cn } from '$lib/utils';
	import { ArrowRight, CircleX, CircleCheck } from '@lucide/svelte';

	const N = 3;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	const root = dir('', [
		dir('Users', [
			dir('Neha', [
				dir('thesis', [file('chapter1.docx'), dir('data', [file('boreholes.csv'), dir('logs', [file('BH-01.txt')])])]),
				dir('mca', [file('assignment1.py')]),
				dir('Documents', [file('notes.txt')])
			])
		])
	]);
	const TARGET = ['Users', 'Neha', 'thesis', 'data', 'boreholes.csv'];
	let cwd = $state(['Users', 'Neha', 'thesis']);
	let path = $state('');
	type Step = { label: string; ok: boolean; kind: 'start' | 'down' | 'up' | 'stay' };
	let trail = $state<Step[] | null>(null);
	let landed = $state<string[] | null>(null);
	let verdict = $state<'' | 'ok' | 'fail'>('');
	let attempts = $state(0);

	const sameAs = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x.toLowerCase() === b[i].toLowerCase());

	function follow() {
		const raw = path.trim();
		if (!raw) return;
		const before = progress.playCount(chapter);
		const { abs, parts } = splitPath(raw);
		const steps: Step[] = [{ label: abs ? 'Start at the root C:\\' : `Start where you stand: ${cwd[cwd.length - 1]}`, ok: true, kind: 'start' }];
		let at = abs ? [] : [...cwd];
		let failed = false;
		for (const p of parts) {
			if (p === '.') {
				steps.push({ label: '. means stay here', ok: true, kind: 'stay' });
				continue;
			}
			if (p === '..') {
				at = at.slice(0, -1);
				steps.push({ label: `.. go up to ${at.length ? at[at.length - 1] : 'C:\\'}`, ok: true, kind: 'up' });
				continue;
			}
			const here = getNode(root, at);
			const next = here && here.type === 'dir' ? here.children.get(p.toLowerCase()) : undefined;
			if (!next) {
				steps.push({ label: `look for ${p}: not in ${at.length ? at[at.length - 1] : 'C:\\'}`, ok: false, kind: 'down' });
				failed = true;
				break;
			}
			at = [...at, next.name];
			steps.push({ label: `into ${next.name}`, ok: true, kind: 'down' });
		}
		trail = steps;
		landed = failed ? null : canonical(root, at);
		verdict = failed ? 'fail' : 'ok';
		if (!failed && sameAs(at, TARGET)) {
			if (abs) progress.markPlay(N, 'abs');
			else if (sameAs(cwd, ['Users', 'Neha', 'thesis'])) progress.markPlay(N, 'rel');
			if (!abs && sameAs(cwd, ['Users', 'Neha', 'mca']) && parts.includes('..')) progress.markPlay(N, 'up');
		}
		if (failed && !abs) progress.markPlay(N, 'fail');
		attempts = progress.playCount(chapter) > before ? 0 : attempts + 1;
	}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<Card.Root>
		<Card.Header>
			<Card.Title>Neha’s folders</Card.Title>
			<Card.Description>Click a folder to stand in it (that is the working directory). Then type a path and follow it one step at a time.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-5 md:grid-cols-[minmax(0,15rem)_1fr]">
			<div class="bg-muted/60 rounded-lg p-2">
				<FileTree {root} {cwd} start={['Users', 'Neha']} onpick={(p) => { cwd = p; trail = null; landed = null; verdict = ''; }} highlight={landed} />
			</div>
			<div class="grid content-start gap-4">
				<div class="text-sm">You are standing in <code>{show(cwd)}</code></div>
				<form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); follow(); }}>
					<Input bind:value={path} placeholder={'data\\boreholes.csv'} aria-label="Path to follow" />
					<Button type="submit">Follow</Button>
				</form>
				{#if trail}
					<ol class="grid gap-1.5" aria-live="polite">
						{#each trail as s, i}
							<li class={cn('flex items-center gap-2 text-sm', !s.ok && 'text-hematite font-medium')}>
								{#if i > 0}<ArrowRight class="text-muted-foreground size-3.5 shrink-0" />{:else}<span class="bg-foreground size-2 shrink-0 rounded-full"></span>{/if}
								{s.label}
							</li>
						{/each}
					</ol>
					{#if verdict === 'ok' && landed}
						<p class="text-malachite flex items-start gap-2 text-sm font-medium"><CircleCheck class="mt-0.5 size-4 shrink-0" /> Found <code>{show(landed)}</code></p>
					{:else}
						<p class="text-hematite flex items-start gap-2 text-sm"><CircleX class="mt-0.5 size-4 shrink-0" /> FileNotFoundError. The path is fine as text, but it doesn't lead anywhere from where you are standing.</p>
					{/if}
				{/if}
				<div class="text-muted-foreground border-l-[3px] pl-3 text-sm">
					Try <code>data\boreholes.csv</code> from thesis, <code>..\thesis\data\boreholes.csv</code> from mca, and <code>C:\Users\Neha\thesis\data\boreholes.csv</code> from anywhere.
				</div>
			</div>
		</Card.Content>
	</Card.Root>
	<MissionList {chapter} {attempts} class="self-start max-lg:order-first lg:sticky lg:top-6" />
</div>
