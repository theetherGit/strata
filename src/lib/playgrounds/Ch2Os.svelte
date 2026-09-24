<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import MissionList from '$lib/components/MissionList.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { Play, Pause, StepForward, RotateCcw, Cpu, Check, X } from '@lucide/svelte';
	import { onDestroy } from 'svelte';

	const N = 2;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	const PROCS = [
		{ name: 'Browser', work: 10, color: 'var(--lapis)' },
		{ name: 'Music player', work: 5, color: 'var(--ochre)' },
		{ name: 'Your script', work: 8, color: 'var(--malachite)' }
	];
	let slice = $state(2);
	let left = $state(PROCS.map((p) => p.work));
	let timeline = $state<number[]>([]);
	let cur = $state(0);
	let used = $state(0);
	let switches = $state(0);
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | null = null;
	const finished = $derived(left.every((l) => l === 0));
	const slicesDone = new Set<number>();

	function next() {
		for (let k = 1; k <= PROCS.length; k++) {
			const j = (cur + k) % PROCS.length;
			if (left[j] > 0) {
				if (j !== cur) switches++;
				cur = j;
				used = 0;
				return;
			}
		}
	}
	function step() {
		if (finished) return stop();
		if (left[cur] === 0) next();
		left[cur]--;
		timeline = [...timeline, cur];
		used++;
		if (left[cur] === 0 || used >= slice) next();
		if (left.every((l) => l === 0)) {
			stop();
			progress.markPlay(N, 'run');
			slicesDone.add(slice);
			if (slicesDone.size >= 2) progress.markPlay(N, 'slice');
		}
	}
	function play() {
		if (finished) reset();
		playing = true;
		timer = setInterval(step, 380);
	}
	function stop() {
		playing = false;
		if (timer) clearInterval(timer);
		timer = null;
	}
	function reset() {
		stop();
		left = PROCS.map((p) => p.work);
		timeline = [];
		cur = 0;
		used = 0;
		switches = 0;
	}
	onDestroy(stop);

	const JOBS = ['Scheduling', 'Memory', 'Files', 'Drivers', 'Permissions'] as const;
	const REQS = [
		{ t: 'Keep the music playing while you type in Word', a: 'Scheduling', e: 'Sharing the CPU between programs is scheduling.' },
		{ t: 'Run your script and the browser at the same time', a: 'Scheduling', e: 'The OS switches the CPU between them many times a second.' },
		{ t: 'Give the browser space to hold a large web page', a: 'Memory', e: 'Handing out bench space (RAM) is memory management.' },
		{ t: "Stop one program reading another program's memory", a: 'Memory', e: 'The OS keeps each program to its own part of RAM.' },
		{ t: 'Open thesis.docx from the Documents folder', a: 'Files', e: 'Finding and reading files in storage is the file system’s job.' },
		{ t: 'Print a map on the department printer', a: 'Drivers', e: 'Devices are reached through drivers.' },
		{ t: 'Connect to the campus Wi-Fi', a: 'Drivers', e: 'The Wi-Fi hardware is controlled through its driver.' },
		{ t: 'Install a new program for every user', a: 'Permissions', e: 'The OS checks you are allowed to, which is why it asks for an administrator password.' }
	];
	let answers = $state<Record<number, string>>({});
	const correct = $derived(REQS.filter((r, i) => answers[i] === r.a).length);
	$effect(() => {
		if (correct === REQS.length) progress.markPlay(N, 'sort');
	});
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
<MissionList {chapter} class="self-start lg:sticky lg:top-6 lg:order-last" />
<div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>One CPU, three programs</Card.Title>
			<Card.Description>The CPU can only work on one process at a time. The OS gives each a short turn, a time slice, then switches. Each coloured square below is one tick of CPU time.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-5">
			<div class="grid gap-3">
				{#each PROCS as p, i}
					<div class="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3">
						<div class={cn('flex items-center gap-2 text-sm font-medium', cur === i && !finished && 'font-semibold')}>
							<i class="size-3 rounded-sm" style={`background:${p.color}`}></i>{p.name}
						</div>
						<div class="bg-muted h-3 overflow-hidden rounded-full">
							<div class="h-full rounded-full transition-[width] duration-300" style={`width:${((p.work - left[i]) / p.work) * 100}%;background:${p.color}`}></div>
						</div>
						<div class="text-muted-foreground text-right font-mono text-xs">{left[i] === 0 ? 'done' : `${left[i]} left`}</div>
					</div>
				{/each}
			</div>
			<div class="flex items-center gap-3">
				<div class={cn('bg-card flex items-center gap-2 rounded-lg border-[1.5px] px-3 py-2 text-sm', !finished && timeline.length && 'border-foreground')}>
					<Cpu class="size-4" />
					CPU is running: <strong>{finished ? 'nothing (all done)' : timeline.length ? PROCS[cur].name : '—'}</strong>
				</div>
				<span class="text-muted-foreground text-sm">{switches} switches so far</span>
			</div>
			<div>
				<div class="text-muted-foreground mb-1.5 text-xs">Timeline, left to right</div>
				<div class="flex min-h-5 flex-wrap gap-[3px]">
					{#each timeline as t, i (i)}<i class="block size-4 rounded-[3px]" style={`background:${PROCS[t].color}`} title={PROCS[t].name}></i>{/each}
				</div>
			</div>
			<div class="flex flex-wrap items-center gap-4">
				<div class="flex gap-2">
					{#if playing}<Button size="sm" onclick={stop}><Pause /> Pause</Button>{:else}<Button size="sm" onclick={play}><Play /> {finished ? 'Run again' : 'Run'}</Button>{/if}
					<Button size="sm" variant="outline" onclick={step} disabled={playing || finished}><StepForward /> One tick</Button>
					<Button size="sm" variant="outline" onclick={reset}><RotateCcw /> Reset</Button>
				</div>
				<label class="flex items-center gap-2 text-sm">
					Time slice
					<input type="range" min="1" max="5" bind:value={slice} disabled={playing} class="accent-malachite w-28" />
					<span class="font-mono">{slice} tick{slice > 1 ? 's' : ''}</span>
				</label>
			</div>
			<p class="text-muted-foreground text-sm">A short slice means more switching, so every program feels responsive. A long slice wastes less time switching but can make other programs wait. Real systems switch thousands of times a second.</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Who handles it?</Card.Title>
			<Card.Description>Programs keep asking the lab manager for things. Pick which of its five jobs each request belongs to. {correct} of {REQS.length} right.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-3">
			{#each REQS as r, i}
				{@const picked = answers[i]}
				<div class={cn('rounded-lg border-[1.5px] p-3', picked && (picked === r.a ? 'border-malachite' : 'border-hematite'))}>
					<p class="mb-2 font-medium">{r.t}</p>
					<div class="flex flex-wrap gap-1.5" role="group" aria-label="Choose a job">
						{#each JOBS as j}
							<button
								type="button"
								onclick={() => (answers[i] = j)}
								aria-pressed={picked === j}
								class={cn(
									'focus-visible:ring-ring/60 cursor-pointer rounded-md border-[1.5px] px-2.5 py-1 text-sm outline-none focus-visible:ring-[3px]',
									picked === j ? (j === r.a ? 'bg-malachite-soft border-malachite text-malachite font-semibold' : 'bg-hematite-soft border-hematite text-hematite') : 'hover:bg-accent'
								)}>{j}</button
							>
						{/each}
					</div>
					{#if picked}
						<p class="mt-2 flex items-start gap-1.5 text-sm">
							{#if picked === r.a}<Check class="text-malachite mt-0.5 size-4 shrink-0" />{r.e}{:else}<X class="text-hematite mt-0.5 size-4 shrink-0" />Not quite. Try another job.{/if}
						</p>
					{/if}
				</div>
			{/each}
		</Card.Content>
	</Card.Root>
</div>
</div>
