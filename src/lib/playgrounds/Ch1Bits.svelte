<script lang="ts">
	import { progress } from '$lib/progress.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';
	import MissionList from '$lib/components/MissionList.svelte';
	import { CHAPTERS } from '$lib/data/chapters';
	import { Save, Zap, Power, FolderOpen, HardDrive, MemoryStick } from '@lucide/svelte';

	const N = 1;
	const chapter = CHAPTERS.find((c) => c.n === N)!;
	let bits = $state([false, false, false, false, false, false, false, false]); // index 0 = 128
	const values = [128, 64, 32, 16, 8, 4, 2, 1];
	const total = $derived(bits.reduce((s, b, i) => s + (b ? values[i] : 0), 0));
	const printable = $derived(total >= 32 && total <= 126);
	$effect(() => {
		if (total === 65) progress.markPlay(N, 'a65');
		if (total === 255) progress.markPlay(N, 'all');
	});

	let word = $state('');
	const bytes = $derived([...new TextEncoder().encode(word)]);
	$effect(() => {
		if (word.trim().toUpperCase() === 'NEHA') progress.markPlay(N, 'name');
	});

	let ram = $state('Sample NH-07: dunite, 3.25 g/cm³');
	let disk = $state<string | null>(null);
	let powered = $state(true);
	let flash = $state(false);
	let hadCut = $state(false);
	let log = $state('The note is on the bench (RAM). Nothing is in the archive yet.');
	function save() {
		disk = ram;
		log = 'Saved: a copy of the note is now in the archive (storage).';
	}
	function cut() {
		powered = false;
		flash = true;
		setTimeout(() => (flash = false), 450);
		ram = '';
		hadCut = true;
		log = disk ? 'Power cut! The bench is wiped. The archive still holds your saved copy.' : 'Power cut! The bench is wiped, and nothing was saved. The note is gone.';
	}
	function powerOn() {
		powered = true;
		log = 'Power is back. The bench is empty; open the file to copy it back from storage.';
	}
	function open() {
		if (!disk) {
			log = 'There is nothing in the archive to open.';
			return;
		}
		ram = disk;
		log = 'Opened: the file was copied from storage back onto the bench.';
		if (hadCut) progress.markPlay(N, 'power');
	}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
<MissionList {chapter} class="self-start lg:sticky lg:top-6 lg:order-last" />
<div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Eight switches, one byte</Card.Title>
			<Card.Description>Each switch lights a lamp. Every lamp is worth double the one to its right, so eight of them count from 0 to 255.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-5">
			<div class="grid grid-cols-8 gap-1.5 sm:gap-3">
				{#each values as v, i}
					<div class="flex flex-col items-center gap-2">
						<svg viewBox="0 0 40 52" class="w-full max-w-12" aria-hidden="true">
							<circle cx="20" cy="20" r="15" class={cn('transition-all duration-200', bits[i] ? 'fill-lamp' : 'fill-muted')} style={bits[i] ? 'filter: drop-shadow(0 0 6px var(--lamp))' : ''} stroke="currentColor" stroke-width="1.5" />
							<rect x="13" y="35" width="14" height="10" rx="2" class="fill-foreground/70" />
						</svg>
						<button
							type="button"
							role="switch"
							aria-checked={bits[i]}
							aria-label={`Switch worth ${v}`}
							onclick={() => (bits[i] = !bits[i])}
							class={cn('focus-visible:ring-ring/60 relative h-12 w-7 cursor-pointer rounded-md border-[1.5px] outline-none focus-visible:ring-[3px]', bits[i] ? 'bg-malachite-soft border-malachite' : 'bg-card border-foreground/60')}
						>
							<span class={cn('bg-foreground absolute left-1/2 h-4 w-3.5 -translate-x-1/2 rounded-sm transition-all duration-200', bits[i] ? 'top-1' : 'bottom-1')}></span>
						</button>
						<span class="text-muted-foreground font-mono text-xs">{v}</span>
						<span class="font-mono text-sm font-semibold">{bits[i] ? 1 : 0}</span>
					</div>
				{/each}
			</div>
			<div class="grid gap-3 sm:grid-cols-3">
				<div class="bg-muted rounded-lg p-3"><div class="text-muted-foreground text-xs">As binary</div><div class="font-mono text-lg">{bits.map((b) => (b ? 1 : 0)).join('')}</div></div>
				<div class="bg-muted rounded-lg p-3"><div class="text-muted-foreground text-xs">As a number</div><div class="font-mono text-lg">{total}</div></div>
				<div class="bg-muted rounded-lg p-3"><div class="text-muted-foreground text-xs">As a letter (ASCII)</div><div class="font-mono text-lg">{printable ? `“${String.fromCharCode(total)}”` : '—'}</div></div>
			</div>
			<p class="text-muted-foreground text-sm">
				{#if total}{values.filter((_, i) => bits[i]).join(' + ')} = {total}.{/if} The same eight lamps are a number to one program and a letter to another. Nothing in the byte says which.
			</p>
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" onclick={() => (bits = bits.map(() => false))}>All off</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Words are bytes too</Card.Title>
			<Card.Description>Type anything. Each character becomes one or more bytes when saved in a file.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<Input bind:value={word} placeholder="Type NEHA, then try neha" aria-label="Text to turn into bytes" class="max-w-sm" />
			{#if bytes.length}
				<div class="flex flex-wrap gap-2">
					{#each bytes as b, i}
						<div class="bg-muted grid min-w-[5.2rem] gap-1 rounded-lg p-2 text-center">
							<div class="font-mono text-base font-semibold">{b >= 32 && b <= 126 ? String.fromCharCode(b) : '·'}</div>
							<div class="font-mono text-xs">{b}</div>
							<div class="flex justify-center gap-[3px]" aria-label={b.toString(2).padStart(8, '0')}>
								{#each b.toString(2).padStart(8, '0').split('') as d}<i class={cn('block size-1.5 rounded-full', d === '1' ? 'bg-lamp' : 'bg-foreground/20')}></i>{/each}
							</div>
						</div>
					{/each}
				</div>
				<p class="text-sm"><strong>{bytes.length}</strong> byte{bytes.length === 1 ? '' : 's'} for {[...word].length} character{[...word].length === 1 ? '' : 's'}. Capital N is 78 but small n is 110: they are different letters to a computer. Try an emoji and watch it take four bytes.</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>The bench and the archive</Card.Title>
			<Card.Description>RAM is fast but forgets everything when the power goes. Storage is slower but keeps what you save.</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-4">
			<div class={cn('grid gap-3 rounded-lg transition-colors sm:grid-cols-2', flash && 'bg-lamp/40')}>
				<div class={cn('rounded-lg border-[1.5px] p-3', !powered && 'opacity-50')}>
					<div class="mb-2 flex items-center gap-2 font-semibold"><MemoryStick class="size-4" /> RAM, the bench</div>
					<Input bind:value={ram} disabled={!powered} aria-label="Note on the bench (RAM)" placeholder={powered ? '(empty)' : '(no power)'} />
				</div>
				<div class="rounded-lg border-[1.5px] p-3">
					<div class="mb-2 flex items-center gap-2 font-semibold"><HardDrive class="size-4" /> Storage, the archive</div>
					<div class="bg-muted min-h-9 rounded-md px-3 py-1.5 font-mono text-sm">{disk ? `notes.txt: ${disk}` : '(nothing saved)'}</div>
				</div>
			</div>
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" onclick={save} disabled={!powered || !ram}><Save /> Save</Button>
				<Button variant="destructive" size="sm" onclick={cut} disabled={!powered}><Zap /> Power cut</Button>
				<Button variant="outline" size="sm" onclick={powerOn} disabled={powered}><Power /> Power on</Button>
				<Button variant="outline" size="sm" onclick={open} disabled={!powered}><FolderOpen /> Open file</Button>
			</div>
			<p class="text-sm" aria-live="polite">{log}</p>
		</Card.Content>
	</Card.Root>
</div>
</div>
