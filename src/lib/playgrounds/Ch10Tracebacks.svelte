<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import * as Card from '$lib/components/ui/card';
	import MissionList from '$lib/components/MissionList.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { cn } from '$lib/utils';
	import { Check, X } from '@lucide/svelte';

	const N = 10;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	const P = [
		{
			id: 't1',
			title: 'A density that divides by zero',
			code: 'mass = 265\nvolume = 0\ndensity = mass / volume',
			tb: ['Traceback (most recent call last):', '  File "density.py", line 3, in <module>', '    density = mass / volume', 'ZeroDivisionError: division by zero'],
			fixes: ['Reinstall Python', 'Check the volume value: it is 0, so there is nothing to divide by', 'Rename the file'],
			fix: 1,
			why: 'The error is about the data, not Python. A blank or zero volume in a spreadsheet often causes this.'
		},
		{
			id: 't2',
			title: 'A misspelled name',
			code: 'avrage = 8.25 / 3\nprint(average)',
			tb: ['Traceback (most recent call last):', '  File "mean.py", line 2, in <module>', '    print(average)', "NameError: name 'average' is not defined. Did you mean: 'avrage'?"],
			fixes: ["Use the same spelling on both lines", 'Install a package called average', 'Add more print statements'],
			fix: 0,
			why: "Python even suggests the fix. To Python, avrage and average are unrelated names."
		},
		{
			id: 't3',
			title: 'Joining text and a number',
			code: 'mean = 2.95\nprint("Mean density: " + mean)',
			tb: ['Traceback (most recent call last):', '  File "report.py", line 2, in <module>', '    print("Mean density: " + mean)', 'TypeError: can only concatenate str (not "float") to str'],
			fixes: ['Turn the number into text first: str(mean)', 'Delete the print line', 'Make mean a bigger number'],
			fix: 0,
			why: '+ joins two pieces of text, or adds two numbers, but not one of each. str(mean) or an f-string fixes it.'
		},
		{
			id: 't4',
			title: 'A file that “isn’t there”',
			code: 'import pandas as pd\nsamples = pd.read_csv("data/boreholes.csv")',
			tb: [
				'Traceback (most recent call last):',
				'  File "C:\\Users\\Neha\\mca\\load.py", line 2, in <module>',
				'    samples = pd.read_csv("data/boreholes.csv")',
				'  File "...\\site-packages\\pandas\\io\\parsers\\readers.py", line 1026, in read_csv',
				'    return _read(filepath_or_buffer, kwds)',
				"FileNotFoundError: [Errno 2] No such file or directory: 'data/boreholes.csv'"
			],
			fixes: ['pandas is broken; reinstall it', 'Run the script from the thesis folder, or use the full path', 'Rename boreholes.csv'],
			fix: 1,
			why: 'The middle lines are inside pandas; skip them. The script ran from mca, so the relative path looked in the wrong place (Chapter 3).'
		}
	];
	let line = $state<Record<string, number | undefined>>({});
	let fix = $state<Record<string, number | undefined>>({});
	function pickLine(p: (typeof P)[number], i: number) {
		line[p.id] = i;
	}
	function pickFix(p: (typeof P)[number], i: number) {
		fix[p.id] = i;
		if (i === p.fix && line[p.id] === p.tb.length - 1) progress.markPlay(N, p.id);
	}
	const lineMsg = (p: (typeof P)[number], i: number) =>
		i === p.tb.length - 1 ? 'Yes. The last line names the error and says what went wrong.' : i === 0 ? 'That is just the heading. Start from the bottom.' : p.tb[i].trim().startsWith('File') ? 'That tells you where, which is useful second. Read the bottom line first.' : 'That shows the code involved. Read the bottom line first.';
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5">
		{#each P as p}
			{@const picked = line[p.id]}
			<Card.Root>
				<Card.Header>
					<Card.Title>{p.title}</Card.Title>
					<Card.Description>1. Click the line that tells you what went wrong. 2. Choose the fix.</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-3">
					<pre class="my-0">{p.code}</pre>
					<div class="overflow-x-auto rounded-md bg-[#012456] py-2 font-mono text-[0.8rem]" role="group" aria-label="Traceback lines">
						{#each p.tb as l, i}
							<button
								type="button"
								onclick={() => pickLine(p, i)}
								class={cn(
									'block w-full cursor-pointer px-3 py-0.5 text-left whitespace-pre text-[#ff9b8a] hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none',
									picked === i && (i === p.tb.length - 1 ? 'bg-[#1f7a5c]/60 text-white' : 'bg-[#a8741f]/50 text-white')
								)}>{l}</button
							>
						{/each}
					</div>
					{#if picked !== undefined}
						<p class={cn('text-sm', picked === p.tb.length - 1 ? 'text-malachite' : 'text-ochre')} aria-live="polite">{lineMsg(p, picked)}</p>
					{/if}
					{#if picked === p.tb.length - 1}
						<div class="grid gap-1.5" role="group" aria-label="Choose a fix">
							{#each p.fixes as f, i}
								<button
									type="button"
									onclick={() => pickFix(p, i)}
									class={cn('flex cursor-pointer items-center gap-2 rounded-md border-[1.5px] px-3 py-2 text-left text-sm', fix[p.id] === i ? (i === p.fix ? 'border-malachite bg-malachite-soft' : 'border-hematite bg-hematite-soft') : 'hover:bg-accent')}
								>
									{#if fix[p.id] === i}{#if i === p.fix}<Check class="text-malachite size-4 shrink-0" />{:else}<X class="text-hematite size-4 shrink-0" />{/if}{/if}
									{f}
								</button>
							{/each}
						</div>
						{#if fix[p.id] === p.fix}<p class="text-sm">{p.why}</p>{/if}
					{/if}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
	<MissionList {chapter} class="self-start max-lg:order-first lg:sticky lg:top-6" />
</div>
