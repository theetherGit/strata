<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import MissionList from '$lib/components/MissionList.svelte';
	import PredictCards from '$lib/components/PredictCards.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { cn } from '$lib/utils';
	import { StepForward, StepBack, RotateCcw, Play, Pause } from '@lucide/svelte';
	import { onDestroy } from 'svelte';

	const N = 6;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	type Frame = { name: string; vars: [string, string][] };
	type Step = { line: number; frames: Frame[]; out: string[]; changed?: string; note: string };
	type Prog = { id: string; title: string; code: string[]; steps: Step[] };
	const g = (vars: [string, string][]): Frame => ({ name: 'Your program', vars });

	const PROGS: Prog[] = [
		{
			id: 'p1',
			title: 'Porosity',
			code: ['porosity = 0.23', 'volume = 150', 'pore_volume = porosity * volume', 'print("Pore volume:", pore_volume)'],
			steps: [
				{ line: -1, frames: [g([])], out: [], note: 'The interpreter is about to start at line 1. The bench (RAM) is empty.' },
				{ line: 0, frames: [g([['porosity', '0.23']])], out: [], changed: 'porosity', note: 'Line 1 makes a box labelled porosity and puts 0.23 in it.' },
				{ line: 1, frames: [g([['porosity', '0.23'], ['volume', '150']])], out: [], changed: 'volume', note: 'Line 2 makes a second box, volume.' },
				{ line: 2, frames: [g([['porosity', '0.23'], ['volume', '150'], ['pore_volume', '34.5']])], out: [], changed: 'pore_volume', note: 'Line 3 reads the two boxes, multiplies them on the CPU, and stores the answer in a new box.' },
				{ line: 3, frames: [g([['porosity', '0.23'], ['volume', '150'], ['pore_volume', '34.5']])], out: ['Pore volume: 34.5'], note: 'Line 4 asks the OS to show text on the screen. The program ends; its boxes are cleared from RAM.' }
			]
		},
		{
			id: 'p2',
			title: 'Summing a list',
			code: ['densities = [2.5, 3.0, 2.75]', 'total = 0', 'for d in densities:', '    total = total + d', 'print(total / 3)'],
			steps: (() => {
				const D: [string, string] = ['densities', '[2.5, 3.0, 2.75]'];
				return [
					{ line: -1, frames: [g([])], out: [], note: 'About to start. Watch the box called total.' },
					{ line: 0, frames: [g([D])], out: [], changed: 'densities', note: 'One box can hold a whole list of values.' },
					{ line: 1, frames: [g([D, ['total', '0']])], out: [], changed: 'total', note: 'total starts at zero, like zeroing a balance.' },
					{ line: 2, frames: [g([D, ['total', '0'], ['d', '2.5']])], out: [], changed: 'd', note: 'The loop takes the first value and puts it in d.' },
					{ line: 3, frames: [g([D, ['total', '2.5'], ['d', '2.5']])], out: [], changed: 'total', note: 'The indented line runs: total becomes 0 + 2.5.' },
					{ line: 2, frames: [g([D, ['total', '2.5'], ['d', '3.0']])], out: [], changed: 'd', note: 'Back to the for line: d now holds the second value.' },
					{ line: 3, frames: [g([D, ['total', '5.5'], ['d', '3.0']])], out: [], changed: 'total', note: 'total becomes 2.5 + 3.0. The old value is replaced, not kept.' },
					{ line: 2, frames: [g([D, ['total', '5.5'], ['d', '2.75']])], out: [], changed: 'd', note: 'Third and last value.' },
					{ line: 3, frames: [g([D, ['total', '8.25'], ['d', '2.75']])], out: [], changed: 'total', note: 'total becomes 5.5 + 2.75.' },
					{ line: 2, frames: [g([D, ['total', '8.25'], ['d', '2.75']])], out: [], note: 'No values left, so the loop ends and Python skips past the indented line.' },
					{ line: 4, frames: [g([D, ['total', '8.25'], ['d', '2.75']])], out: ['2.75'], note: 'The mean density is printed. The same three lines ran three times: that is a loop.' }
				];
			})()
		},
		{
			id: 'p3',
			title: 'Calling a function',
			code: ['def density(mass, volume):', '    return mass / volume', '', 'rock = density(265, 100)', 'print(rock)'],
			steps: [
				{ line: -1, frames: [g([])], out: [], note: 'About to start.' },
				{ line: 0, frames: [g([['density', '(a function)']])], out: [], changed: 'density', note: 'def does not run the calculation yet. It stores the recipe under the name density.' },
				{ line: 3, frames: [g([['density', '(a function)']])], out: [], note: 'Line 4 calls the function. Python jumps into it, bringing 265 and 100.' },
				{ line: 1, frames: [g([['density', '(a function)']]), { name: 'Inside density()', vars: [['mass', '265'], ['volume', '100']] }], out: [], changed: 'mass', note: 'A separate, temporary set of boxes appears for the function’s inputs.' },
				{ line: 3, frames: [g([['density', '(a function)'], ['rock', '2.65']])], out: [], changed: 'rock', note: 'return hands 2.65 back. The function’s temporary boxes are thrown away and the answer goes into rock.' },
				{ line: 4, frames: [g([['density', '(a function)'], ['rock', '2.65']])], out: ['2.65'], note: 'Printed. You could now call density again with different numbers.' }
			]
		}
	];

	let which = $state('p1');
	let idx = $state<Record<string, number>>({ p1: 0, p2: 0, p3: 0 });
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | null = null;
	const prog = $derived(PROGS.find((p) => p.id === which)!);
	const step = $derived(prog.steps[idx[which]]);
	function go(d: number) {
		const n = Math.max(0, Math.min(prog.steps.length - 1, idx[which] + d));
		idx[which] = n;
		if (n === prog.steps.length - 1) {
			progress.markPlay(N, prog.id);
			stop();
		}
	}
	function play() {
		if (idx[which] === prog.steps.length - 1) idx[which] = 0;
		playing = true;
		timer = setInterval(() => go(1), 1400);
	}
	function stop() {
		playing = false;
		if (timer) clearInterval(timer);
		timer = null;
	}
	onDestroy(stop);

	let right = 0;
	const cards = [
		{ code: 'print(3 + 4 * 2)', answer: '11', e: 'Multiplication happens before addition, as in maths: 4 × 2 = 8, then 3 + 8.' },
		{ code: 'x = 5\nx = x + 1\nprint(x)', answer: '6', e: 'The right side is worked out first using the old value, then stored back in the same box.' },
		{ code: 'rock = "basalt"\nprint(rock.upper())', answer: 'BASALT', e: '.upper() is a method: an action that text values know how to do.' },
		{ code: 'print(len("granite"))', answer: '7', e: 'len counts the characters in the text.' }
	];
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
		<Card.Root>
			<Card.Header>
				<Card.Title>Line by line</Card.Title>
				<Card.Description>Step through a program the way Python does, one line at a time. Each variable is a labelled box on the bench.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Tabs.Root bind:value={which} onValueChange={stop}>
					<Tabs.List>
						{#each PROGS as p}<Tabs.Trigger value={p.id}>{p.title}</Tabs.Trigger>{/each}
					</Tabs.List>
				</Tabs.Root>
				<div class="mt-4 grid gap-4 xl:grid-cols-2">
					<div>
						<div class="text-muted-foreground mb-1.5 text-xs font-medium">Program</div>
						<div class="bg-code overflow-x-auto rounded-md py-2 font-mono text-[0.84rem]">
							{#each prog.code as l, i}
								<div class={cn('flex gap-3 px-3 transition-colors', step.line === i && 'bg-lamp/35')}>
									<span class="text-muted-foreground w-4 shrink-0 text-right select-none">{i + 1}</span>
									<span class="whitespace-pre">{l || ' '}</span>
								</div>
							{/each}
						</div>
						<div class="text-muted-foreground mt-3 mb-1.5 text-xs font-medium">Screen output</div>
						<div class="min-h-10 rounded-md bg-[#012456] px-3 py-2 font-mono text-[0.84rem] text-[#e6edf3]">
							{#each step.out as o}<div>{o}</div>{:else}<span class="text-white/40">(nothing printed yet)</span>{/each}
						</div>
					</div>
					<div>
						<div class="text-muted-foreground mb-1.5 text-xs font-medium">RAM, the bench</div>
						<div class="grid gap-3">
							{#each step.frames as f (f.name)}
								<div class={cn('rounded-lg border-[1.5px] p-2.5', f.name !== 'Your program' && 'border-lapis border-dashed')}>
									<div class="text-muted-foreground mb-2 text-xs">{f.name}</div>
									<div class="flex flex-wrap gap-2">
										{#each f.vars as [k, v] (k)}
											<div class={cn('bg-card rounded-md border-[1.5px] px-2.5 py-1.5 transition-colors duration-300', step.changed === k && 'border-ochre bg-ochre-soft')}>
												<div class="text-muted-foreground font-mono text-[0.7rem]">{k}</div>
												<div class="font-mono text-sm font-semibold">{v}</div>
											</div>
										{:else}<span class="text-muted-foreground text-sm">(empty)</span>{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
				<p class="bg-muted mt-4 rounded-md p-3 text-sm" aria-live="polite"><strong>Step {idx[which]} of {prog.steps.length - 1}.</strong> {step.note}</p>
				<div class="mt-3 flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onclick={() => go(-1)} disabled={idx[which] === 0}><StepBack /> Back</Button>
					<Button size="sm" onclick={() => go(1)} disabled={idx[which] === prog.steps.length - 1}><StepForward /> Next line</Button>
					{#if playing}<Button variant="outline" size="sm" onclick={stop}><Pause /> Pause</Button>{:else}<Button variant="outline" size="sm" onclick={play}><Play /> Auto-play</Button>{/if}
					<Button variant="ghost" size="sm" onclick={() => { stop(); idx[which] = 0; }}><RotateCcw /> Restart</Button>
				</div>
			</Card.Content>
		</Card.Root>
		<section class="grid gap-3">
			<h3 class="font-serif text-xl font-semibold">Predict, then reveal</h3>
			<p class="text-muted-foreground text-sm">Commit to an answer first. Then check it on your own computer too: start <code>python</code> and type the code.</p>
			<PredictCards
				{cards}
				onreveal={(_, ok) => {
					if (ok) right++;
					if (right >= 3) progress.markPlay(N, 'predict');
				}}
			/>
		</section>
	</div>
	<MissionList {chapter} class="self-start max-lg:order-first lg:sticky lg:top-6" />
</div>
