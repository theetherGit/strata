<script lang="ts">
	import { CHAPTERS, BOOK_URL } from '$lib/data/chapters';
	import { progress } from '$lib/progress.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ListChecks, Joystick, Laptop, ArrowRight, Copy, ClipboardPaste, Shuffle } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input';

	let copied = $state(false);
	let code = $state('');
	let pasteMsg = $state('');
	let showCode = $state('');
	async function copy() {
		const c = progress.exportCode();
		showCode = c;
		try {
			await navigator.clipboard.writeText(c);
			copied = true;
			setTimeout(() => (copied = false), 2500);
		} catch {
			copied = false;
		}
	}
	function paste() {
		pasteMsg = progress.importCode(code) ? 'Progress loaded. Your column is updated.' : 'That does not look like a progress code.';
		if (pasteMsg.startsWith('Progress')) code = '';
	}

	const next = $derived(CHAPTERS.find((c) => progress.fraction(c) < 1) ?? CHAPTERS[0]);
</script>

<div class="grid max-w-3xl gap-10">
	<section class="grid gap-4">
		<h1 class="font-serif text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl">Build your column, one layer at a time.</h1>
		<p class="text-muted-foreground max-w-[38rem] text-lg">Each chapter of <a href={BOOK_URL} target="_blank" rel="noopener">The Missing Context</a> is a rock layer. Finish its parts and the layer is deposited, from the computer at the bottom to the capstone project at the top.</p>
		<div class="flex flex-wrap gap-3 pt-1">
			<Button href={`#/ch/${next.n}`} size="lg">{progress.deposited ? 'Continue' : 'Start'} with Chapter {next.n} <ArrowRight /></Button>
		</div>
	</section>

	<section class="grid gap-4 sm:grid-cols-3">
		<div class="grid content-start gap-2">
			<ListChecks class="text-malachite size-6" />
			<h2 class="font-serif text-lg font-semibold">Assessment</h2>
			<p class="text-muted-foreground text-sm">Five questions with an explanation for every answer. Pass with four.</p>
		</div>
		<div class="grid content-start gap-2">
			<Joystick class="text-ochre size-6" />
			<h2 class="font-serif text-lg font-semibold">Playground</h2>
			<p class="text-muted-foreground text-sm">Things to flip, step through and break, right here in the browser: lamps, a scheduler, a practice terminal, Git’s three trays.</p>
		</div>
		<div class="grid content-start gap-2">
			<Laptop class="text-lapis size-6" />
			<h2 class="font-serif text-lg font-semibold">On your computer</h2>
			<p class="text-muted-foreground text-sm">The real thing, on your own laptop. You type what you see, and the page checks it.</p>
		</div>
	</section>

	<section class="bg-card grid gap-3 rounded-xl border-[1.5px] p-5">
		<h2 class="font-serif text-xl font-semibold">Take your progress with you</h2>
		<p class="text-muted-foreground text-sm">Progress lives in this browser. To continue on another laptop or your phone, copy a code here and paste it there. Ticked missions and answers travel; the practice terminals start fresh.</p>
		<div class="flex flex-wrap items-center gap-2">
			<Button variant="outline" size="sm" onclick={copy}><Copy /> {copied ? 'Copied' : 'Copy my progress code'}</Button>
			{#if progress.deposited}<Button variant="ghost" size="sm" href="#/review"><Shuffle /> Review five questions</Button>{/if}
		</div>
		{#if showCode}<textarea readonly class="bg-background border-input h-16 w-full rounded-md border-[1.5px] p-2 font-mono text-xs" aria-label="Your progress code">{showCode}</textarea>{/if}
		<form class="flex flex-wrap gap-2" onsubmit={(e) => { e.preventDefault(); paste(); }}>
			<Input bind:value={code} placeholder="Paste a progress code" class="max-w-md" />
			<Button type="submit" variant="outline" size="sm" disabled={!code.trim()}><ClipboardPaste /> Load it here</Button>
		</form>
		{#if pasteMsg}<p class="text-sm" aria-live="polite">{pasteMsg}</p>{/if}
	</section>

	<section class="grid gap-2">
		<h2 class="mb-1 font-serif text-2xl font-semibold">Chapters</h2>
		<ol class="divide-border border-border divide-y-[1.5px] border-y-[1.5px]">
			{#each CHAPTERS as c (c.n)}
				{@const f = progress.fraction(c)}
				<li>
					<a href={`#/ch/${c.n}`} class="text-foreground! hover:bg-accent/60 flex items-center gap-4 px-2 py-3 no-underline!">
						<span class="text-muted-foreground w-6 text-right font-mono text-sm">{c.n}</span>
						<span class="flex-1">
							<span class="font-medium">{c.title}</span>
							<span class="text-muted-foreground block text-sm">{c.blurb}</span>
						</span>
						{#if f === 1}<Badge variant="malachite">Deposited</Badge>{:else if f > 0}<Badge variant="ochre">In progress</Badge>{/if}
					</a>
				</li>
			{/each}
		</ol>
	</section>
</div>
