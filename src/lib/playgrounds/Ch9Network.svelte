<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import MissionList from '$lib/components/MissionList.svelte';
	import JsonNode from '$lib/components/JsonNode.svelte';
	import { CHAPTERS, verify } from '$lib/data/chapters';
	import { cn } from '$lib/utils';
	import { StepForward, StepBack, RotateCcw, CircleCheck } from '@lucide/svelte';

	const N = 9;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	const STEPS = [
		{ at: 'laptop', text: 'Ready. Your script is about to call requests.get(url).' },
		{ at: 'laptop', text: 'Your code (the client) builds a request for https://earthquake.usgs.gov/…' },
		{ at: 'dns', text: 'First question: where is earthquake.usgs.gov? The laptop asks DNS, the internet’s phone directory.' },
		{ at: 'laptop', text: 'DNS answers with an IP address: the server’s number on the network.' },
		{ at: 'server', text: 'The request crosses the internet to that address. The https lock means it is encrypted on the way.' },
		{ at: 'server', text: 'The USGS server finds this week’s earthquakes and replies with status 200 (OK) and a JSON body.' },
		{ at: 'laptop', text: 'The response arrives. response.json() turns the text into Python lists and dictionaries. Round trip complete.' }
	];
	const POS: Record<string, [number, number]> = { laptop: [70, 128], dns: [270, 40], server: [470, 128] };
	let s = $state(0);
	const [px, py] = $derived(POS[STEPS[s].at]);
	const carrying = $derived(s >= 5 ? 'JSON' : s === 3 ? 'IP' : s >= 1 ? 'GET' : '');
	$effect(() => {
		if (s === STEPS.length - 1) progress.markPlay(N, 'trip');
	});

	const data = {
		type: 'FeatureCollection',
		metadata: { title: 'USGS Magnitude 4.5+ Earthquakes, Past Week (sample)', count: 5 },
		features: [
			{ type: 'Feature', properties: { mag: 5.1, place: '112 km SSW of Tual, Indonesia' }, geometry: { type: 'Point', coordinates: [132.1, -6.6, 35.2] } },
			{ type: 'Feature', properties: { mag: 4.7, place: 'Central Mid-Atlantic Ridge' }, geometry: { type: 'Point', coordinates: [-30.1, 7.8, 10.0] } },
			{ type: 'Feature', properties: { mag: 6.3, place: '45 km E of Hualien City, Taiwan' }, geometry: { type: 'Point', coordinates: [122.1, 24.0, 18.5] } },
			{ type: 'Feature', properties: { mag: 4.5, place: 'Kermadec Islands region' }, geometry: { type: 'Point', coordinates: [-177.9, -29.4, 120.0] } },
			{ type: 'Feature', properties: { mag: 4.9, place: 'Santiago del Estero, Argentina' }, geometry: { type: 'Point', coordinates: [-63.2, -27.8, 565.4] } }
		]
	};
	let sel = $state<{ path: (string | number)[]; value: unknown } | null>(null);
	const expr = $derived(sel ? 'data' + sel.path.map((k) => (typeof k === 'number' ? `[${k}]` : `["${k}"]`)).join('') : '');
	const shown = (v: unknown) => (v !== null && typeof v === 'object' ? (Array.isArray(v) ? `a list of ${v.length} items` : 'a dictionary') : typeof v === 'string' ? `"${v}"` : String(v));

	const Qs = [
		{ id: 'mag', label: 'What is the magnitude of the first earthquake?', kind: 'num' as const, value: 5.1, tol: 0.001, hint: 'features → [0] → properties → mag' },
		{ id: 'count', label: 'How many earthquakes are in the snapshot?', kind: 'num' as const, value: 5, tol: 0, hint: 'Click features: how many items does the list hold?' },
		{ id: 'deep', label: 'What is the depth, in km, of the strongest earthquake?', kind: 'num' as const, value: 18.5, tol: 0.001, hint: 'Find the biggest mag first. Depth is the third number in its geometry coordinates.' }
	];
	let ans = $state<Record<string, string>>({ mag: '', count: '', deep: '' });
	let res = $state<Record<string, boolean | undefined>>({});
	function check(q: (typeof Qs)[number]) {
		const ok = verify({ ...q, label: '', hint: '' }, ans[q.id] ?? '');
		res[q.id] = ok;
		if (ok) progress.markPlay(N, q.id);
	}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
	<div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
		<Card.Root>
			<Card.Header>
				<Card.Title>The round trip</Card.Title>
				<Card.Description>What happens between requests.get(url) and the data arriving.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<svg viewBox="0 0 540 175" class="w-full" role="img" aria-label="Diagram of a request travelling from laptop to server and back">
					<line x1="70" y1="128" x2="470" y2="128" stroke="currentColor" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="4 5" />
					<line x1="70" y1="128" x2="270" y2="40" stroke="currentColor" stroke-opacity="0.2" stroke-width="2" stroke-dasharray="4 5" />
					<g><rect x="30" y="104" width="80" height="48" rx="6" class="fill-card" stroke="currentColor" stroke-width="1.5" /><text x="70" y="126" text-anchor="middle" class="fill-foreground text-[12px] font-semibold">Your laptop</text><text x="70" y="142" text-anchor="middle" class="fill-muted-foreground text-[10px]">client</text></g>
					<g><rect x="225" y="16" width="90" height="46" rx="6" class="fill-card" stroke="currentColor" stroke-width="1.5" /><text x="270" y="37" text-anchor="middle" class="fill-foreground text-[12px] font-semibold">DNS</text><text x="270" y="52" text-anchor="middle" class="fill-muted-foreground text-[10px]">name → address</text></g>
					<g><ellipse cx="270" cy="128" rx="46" ry="20" class="fill-muted" stroke="currentColor" stroke-opacity="0.4" /><text x="270" y="132" text-anchor="middle" class="fill-muted-foreground text-[11px]">the internet</text></g>
					<g><rect x="425" y="104" width="90" height="48" rx="6" class="fill-card" stroke="currentColor" stroke-width="1.5" /><text x="470" y="126" text-anchor="middle" class="fill-foreground text-[12px] font-semibold">USGS server</text><text x="470" y="142" text-anchor="middle" class="fill-muted-foreground text-[10px]">server</text></g>
					{#if carrying}
						<g style={`transform: translate(${px}px, ${py - 34}px); transition: transform 700ms cubic-bezier(.4,.1,.2,1)`}>
							<rect x="-22" y="-11" width="44" height="22" rx="11" fill={carrying === 'JSON' ? 'var(--malachite)' : carrying === 'IP' ? 'var(--ochre)' : 'var(--lapis)'} />
							<text y="4" text-anchor="middle" class="text-[11px] font-semibold" fill="white">{carrying}</text>
						</g>
					{/if}
				</svg>
				<p class="bg-muted min-h-12 rounded-md p-3 text-sm" aria-live="polite"><strong>Step {s} of {STEPS.length - 1}.</strong> {STEPS[s].text}</p>
				<div class="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onclick={() => (s = Math.max(0, s - 1))} disabled={s === 0}><StepBack /> Back</Button>
					<Button size="sm" onclick={() => (s = Math.min(STEPS.length - 1, s + 1))} disabled={s === STEPS.length - 1}><StepForward /> Next</Button>
					<Button variant="ghost" size="sm" onclick={() => (s = 0)}><RotateCcw /> Restart</Button>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Dig through the JSON</Card.Title>
				<Card.Description>A saved sample shaped exactly like the USGS feed (values are illustrative). Click anything to see the Python that reaches it.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4 md:grid-cols-[1fr_16rem]">
				<ul class="bg-muted/60 max-h-[26rem] overflow-auto rounded-lg p-2 font-mono text-[0.8rem] leading-relaxed">
					<JsonNode value={data} path={[]} label="data" onpick={(p, v) => (sel = { path: p, value: v })} selected={sel ? JSON.stringify(sel.path) : ''} />
				</ul>
				<div class="grid content-start gap-3">
					<div class="bg-card rounded-lg border-[1.5px] p-3">
						<div class="text-muted-foreground mb-1 text-xs">In Python</div>
						<code class="block text-[0.8rem] break-all">{expr || 'Click a value in the tree'}</code>
						{#if sel}<div class="mt-2 text-sm">gives <strong>{shown(sel.value)}</strong></div>{/if}
					</div>
					<p class="text-muted-foreground text-sm">Lists are counted from 0, so <code>[0]</code> is the first earthquake. GeoJSON stores position as longitude, latitude, depth.</p>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header><Card.Title>Find it</Card.Title></Card.Header>
			<Card.Content class="grid gap-3">
				{#each Qs as q}
					<div class={cn('rounded-lg border-[1.5px] p-3', res[q.id] && 'border-malachite')}>
						<label for={`q-${q.id}`} class="mb-2 block text-sm font-medium">{q.label}</label>
						<form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); check(q); }}>
							<Input id={`q-${q.id}`} bind:value={ans[q.id]} class="max-w-40" />
							<Button type="submit" variant="outline">Check</Button>
						</form>
						<p class="mt-1.5 text-sm" aria-live="polite">
							{#if res[q.id] === true}<span class="text-malachite inline-flex items-center gap-1.5"><CircleCheck class="size-4" /> Correct.</span>{:else if res[q.id] === false}<span class="text-hematite">Not quite. Hint: {q.hint}</span>{/if}
						</p>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
	<MissionList {chapter} class="self-start max-lg:order-first lg:sticky lg:top-6" />
</div>
