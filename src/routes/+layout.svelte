<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import Strata from '$lib/components/Strata.svelte';
	import { BOOK_URL, FEEDBACK_EMAIL, CHAPTERS } from '$lib/data/chapters';
	import { progress } from '$lib/progress.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { buttonVariants } from '$lib/components/ui/button';
	import { BookOpen, Shuffle, MessageSquare } from '@lucide/svelte';

	let { children } = $props();
	const current = $derived(Number(page.params.n ?? 0));
	const where = $derived(current ? `Chapter ${current} (${CHAPTERS.find((c) => c.n === current)?.short ?? ''}), ${page.params.tab ?? 'quiz'}` : page.url.hash.includes('review') ? 'Review' : 'Home');
	const feedback = $derived(`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Strata site: ' + where)}&body=${encodeURIComponent('Where: ' + where + '\n\nWhat happened:\n\n\nWhat I expected:\n\n\nBrowser and device:\n')}`);
	let resetOpen = $state(false);
</script>

<div class="mx-auto grid max-w-[1320px] gap-x-12 gap-y-8 px-5 pt-6 pb-16 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8 lg:pt-10">
	<header class="flex flex-wrap items-center justify-between gap-3 lg:col-span-2">
		<a href="#/" class="text-foreground! font-serif text-xl font-semibold no-underline!">Neha’s stratigraphic column</a>
		<nav class="flex flex-wrap items-center gap-4 text-sm" aria-label="Site">
			<a href="#/review" class="inline-flex items-center gap-1.5"><Shuffle class="size-4" /> Review</a>
			<a href={BOOK_URL} target="_blank" rel="noopener" class="inline-flex items-center gap-1.5"><BookOpen class="size-4" /> Open the book</a>
		</nav>
	</header>
	<aside class="min-w-0 lg:sticky lg:top-6 lg:self-start">
		<Strata {current} />
	</aside>
	<main class="min-w-0">
		{#key progress.resets}{@render children()}{/key}
	</main>
	<footer class="text-muted-foreground border-border flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] pt-5 text-sm lg:col-span-2">
		<span>Progress is saved in this browser only; copy it from the <a href="#/">home page</a> to move it. Playgrounds are simulations; real Python runs on your own computer.</span>
		<a href={feedback} class="inline-flex items-center gap-1.5"><MessageSquare class="size-4" /> Something wrong here? Tell Shivam</a>
		<AlertDialog.Root bind:open={resetOpen}>
			<AlertDialog.Trigger class={buttonVariants({ variant: 'link', size: 'sm' }) + ' text-destructive! px-0'}>Reset all progress</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Title class="font-serif text-xl font-semibold">Reset all progress?</AlertDialog.Title>
				<AlertDialog.Description class="text-muted-foreground">This clears every assessment score, playground mission and lab answer in this browser. Your column goes back to bare ground.</AlertDialog.Description>
				<div class="flex justify-end gap-2">
					<AlertDialog.Cancel class={buttonVariants({ variant: 'outline' })}>Keep my progress</AlertDialog.Cancel>
					<AlertDialog.Action class={buttonVariants({ variant: 'destructive' })} onclick={() => { resetOpen = false; progress.reset(); }}>Reset everything</AlertDialog.Action>
				</div>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</footer>
</div>
