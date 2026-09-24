<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import MissionList from '$lib/components/MissionList.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { cn } from '$lib/utils';
	import { Play, CircleCheck, RotateCcw } from '@lucide/svelte';

	const N = 13;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	type Row = { sample_id: string; location: string; sio2: number; mgo: number; density: number };
	const ROWS: Row[] = [
		['NH-01', 'Ridge A', 48.2, 8.9, 2.95], ['NH-02', 'Ridge A', 50.1, 7.4, 2.91], ['NH-03', 'Ridge A', 55.6, 4.1, 2.78], ['NH-04', 'Valley B', 61.8, 2.6, 2.72],
		['NH-05', 'Valley B', 68.4, 1.1, 2.66], ['NH-06', 'Valley B', 72.9, 0.4, 2.63], ['NH-07', 'Quarry C', 43.1, 31.5, 3.25], ['NH-08', 'Quarry C', 41.7, 36.2, 3.3],
		['NH-09', 'Quarry C', 51.3, 6.8, 2.89], ['NH-10', 'Ridge A', 58.9, 3.3, 2.75], ['NH-11', 'Valley B', 70.2, 0.7, 2.64], ['NH-12', 'Quarry C', 46.5, 9.8, 2.97]
	].map(([sample_id, location, sio2, mgo, density]) => ({ sample_id, location, sio2, mgo, density }) as Row);

	let split = $state(false);
	function classify(sio2: number): string {
		if (sio2 < 45) return 'ultramafic';
		if (sio2 < 52) return 'mafic';
		if (sio2 < 63) return 'intermediate';
		if (split && sio2 < 69) return 'intermediate-felsic';
		return 'felsic';
	}
	let classified = $state(false);
	let shown = $state(0); // rows revealed so far, for the animation
	let summarised = $state(false);
	const classes = $derived(ROWS.map((r) => classify(r.sio2)));
	const ORDER = ['felsic', 'intermediate', 'intermediate-felsic', 'mafic', 'ultramafic'];
	const summary = $derived(
		ORDER.filter((k) => classes.includes(k)).map((k) => {
			const rows = ROWS.filter((_, i) => classes[i] === k);
			return { k, count: rows.length, mean: rows.reduce((a, r) => a + r.density, 0) / rows.length };
		})
	);
	const pad = (s: string, n: number) => s.padEnd(n);
	const printed = $derived(
		['                     count  mean_density', 'rock_class', ...summary.map((s) => `${pad(s.k, 21)}${String(s.count).padStart(5)}      ${s.mean.toFixed(6)}`)].join('\n')
	);

	async function runClassify() {
		classified = true;
		shown = 0;
		for (let i = 0; i < ROWS.length; i++) {
			await new Promise((r) => setTimeout(r, 90));
			shown = i + 1;
		}
		progress.markPlay(N, 'classify');
	}
	function runSummary() {
		summarised = true;
		progress.markPlay(N, 'summary');
	}
	function reset() {
		classified = false;
		summarised = false;
		shown = 0;
		split = false;
	}

	let guessMafic = $state('');
	let maficResult = $state<boolean | null>(null);
	function checkMafic() {
		maficResult = parseInt(guessMafic, 10) === 4;
		if (maficResult) progress.markPlay(N, 'predict');
	}
	let guessFelsic = $state('');
	let felsicResult = $state<boolean | null>(null);
	function checkFelsic() {
		felsicResult = parseInt(guessFelsic, 10) === 2;
		if (felsicResult) {
			split = true;
			summarised = false;
			progress.markPlay(N, 'tryit');
		}
	}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
		<Card.Root>
			<Card.Header>
				<Card.Title>samples.csv, as pandas sees it</Card.Title>
				<Card.Description>Twelve invented samples. Before touching anything: how many are mafic, meaning SiO₂ from 45 up to but not including 52?</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<form class="flex flex-wrap items-center gap-2" onsubmit={(e) => { e.preventDefault(); checkMafic(); }}>
					<label for="guess-mafic" class="text-sm font-medium">Mafic samples:</label>
					<Input id="guess-mafic" bind:value={guessMafic} class="w-20" inputmode="numeric" />
					<Button type="submit" variant="outline" size="sm">Check</Button>
					{#if maficResult === true}<span class="text-malachite inline-flex items-center gap-1 text-sm"><CircleCheck class="size-4" /> Yes: NH-01, NH-02, NH-09 and NH-12.</span>{:else if maficResult === false}<span class="text-hematite text-sm">Not that. Count the rows with sio2 between 45 and 51.9.</span>{/if}
				</form>
				<div class="overflow-x-auto">
					<table class="w-full font-mono text-[0.8rem]">
						<thead><tr class="text-muted-foreground text-left"><th class="pr-3">sample_id</th><th class="pr-3">location</th><th class="pr-3 text-right">sio2</th><th class="pr-3 text-right">mgo</th><th class="pr-3 text-right">density</th>{#if classified}<th>rock_class</th>{/if}</tr></thead>
						<tbody>
							{#each ROWS as r, i (r.sample_id)}
								<tr class="border-border border-t"><td class="pr-3 py-0.5">{r.sample_id}</td><td class="pr-3">{r.location}</td><td class="pr-3 text-right">{r.sio2.toFixed(1)}</td><td class="pr-3 text-right">{r.mgo.toFixed(1)}</td><td class="pr-3 text-right">{r.density.toFixed(2)}</td>{#if classified}<td class={cn('transition-colors', i < shown ? 'text-malachite font-semibold' : 'text-transparent')}>{classes[i]}</td>{/if}</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="text-muted-foreground text-sm"><code>samples.shape</code> prints <code>(12, 5)</code>: twelve rows, five columns.</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Step 5: classify every sample</Card.Title>
				<Card.Description>apply runs your function on every value in the column and stores the answers in a new column.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-3">
				<pre class="my-0">samples["rock_class"] = samples["sio2"].apply(classify)</pre>
				<div class="flex gap-2"><Button size="sm" onclick={runClassify} disabled={classified && shown < ROWS.length}><Play /> Run</Button>{#if classified}<Button size="sm" variant="ghost" onclick={reset}><RotateCcw /> Start over</Button>{/if}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class={cn(!classified && 'opacity-60')}>
			<Card.Header>
				<Card.Title>Step 6: summarise</Card.Title>
				<Card.Description>groupby sorts the rows into piles by class; agg counts each pile and averages its density.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-3">
				<pre class="my-0">summary = samples.groupby("rock_class").agg(
    count=("sample_id", "count"),
    mean_density=("density", "mean"),
)
print(summary)</pre>
				<div><Button size="sm" onclick={runSummary} disabled={!classified || shown < ROWS.length}><Play /> Run</Button></div>
				{#if summarised}
					<div class="text-muted-foreground text-xs">What the terminal prints</div>
					<pre class="my-0 bg-[#012456] text-[#e6edf3]">{printed}</pre>
					<p class="text-sm">Densities rise from felsic to ultramafic, as they should: more magnesium and iron, heavier rock.</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root class={cn(!summarised && 'opacity-60')}>
			<Card.Header>
				<Card.Title>Try it: split felsic at 69%</Card.Title>
				<Card.Description>The book's Try it adds an “intermediate-felsic” class for 63–69% and keeps “felsic” for 69% and above. Predict first: how many samples stay felsic?</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-3">
				<form class="flex flex-wrap items-center gap-2" onsubmit={(e) => { e.preventDefault(); checkFelsic(); }}>
					<label for="guess-felsic" class="text-sm font-medium">Still felsic:</label>
					<Input id="guess-felsic" bind:value={guessFelsic} class="w-20" inputmode="numeric" disabled={!summarised} />
					<Button type="submit" variant="outline" size="sm" disabled={!summarised}>Check and re-run</Button>
					{#if felsicResult === true}<span class="text-malachite inline-flex items-center gap-1 text-sm"><CircleCheck class="size-4" /> NH-06 and NH-11. NH-05 at 68.4% moves down.</span>{:else if felsicResult === false}<span class="text-hematite text-sm">Not that. Which samples have sio2 of 69 or more?</span>{/if}
				</form>
				{#if split}
					<p class="text-sm">The table above now shows the new class. Press <em>Run</em> on Step 6 again to see the summary change.</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
	<MissionList {chapter} class="self-start max-lg:order-first lg:sticky lg:top-6" />
</div>
