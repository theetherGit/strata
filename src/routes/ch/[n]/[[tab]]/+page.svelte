<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { setContext, tick, type Component } from 'svelte';
	import { CHAPTERS, bookLink } from '$lib/data/chapters';
	import { progress } from '$lib/progress.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import Quiz from '$lib/components/Quiz.svelte';
	import OnComputer from '$lib/components/OnComputer.svelte';
	import PartDone from '$lib/components/PartDone.svelte';
	import { ListChecks, Joystick, Laptop, CircleCheck, ArrowLeft, ArrowRight, BookOpen } from '@lucide/svelte';
	import Ch1 from '$lib/playgrounds/Ch1Bits.svelte';
	import Ch2 from '$lib/playgrounds/Ch2Os.svelte';
	import Ch3 from '$lib/playgrounds/Ch3Paths.svelte';
	import Ch4 from '$lib/playgrounds/Ch4Terminal.svelte';
	import Ch5 from '$lib/playgrounds/Ch5Path.svelte';
	import Ch6 from '$lib/playgrounds/Ch6Stepper.svelte';
	import Ch7 from '$lib/playgrounds/Ch7Packages.svelte';
	import Ch8 from '$lib/playgrounds/Ch8Envs.svelte';
	import Ch9 from '$lib/playgrounds/Ch9Network.svelte';
	import Ch10 from '$lib/playgrounds/Ch10Tracebacks.svelte';
	import Ch11 from '$lib/playgrounds/Ch11Predict.svelte';
	import Ch12 from '$lib/playgrounds/Ch12Git.svelte';
	import Ch13 from '$lib/playgrounds/Ch13Capstone.svelte';

	const PLAY: Record<number, Component<any>> = { 1: Ch1, 2: Ch2, 3: Ch3, 4: Ch4, 5: Ch5, 6: Ch6, 7: Ch7, 8: Ch8, 9: Ch9, 10: Ch10, 11: Ch11, 12: Ch12, 13: Ch13 };
	const NAMES: Record<string, string> = { quiz: 'Assessment', play: 'Playground', lab: 'On your computer' };

	const n = $derived(Number(page.params.n));
	const chapter = $derived(CHAPTERS.find((c) => c.n === n) ?? CHAPTERS[0]);
	const tabs = $derived(['quiz', ...(chapter.play ? ['play'] : []), 'lab']);
	const tab = $derived(tabs.includes(page.params.tab ?? '') ? page.params.tab! : 'quiz');
	const Play = $derived(PLAY[chapter.n]);
	const prev = $derived(CHAPTERS.find((c) => c.n === chapter.n - 1));
	const next = $derived(CHAPTERS.find((c) => c.n === chapter.n + 1));
	const deposited = $derived(progress.fraction(chapter) === 1);
	const nextChapterHref = $derived(next ? `#/ch/${next.n}` : '#/');
	const nextChapterLabel = $derived(next ? `Next chapter: ${next.short}` : 'Back to the column');

	/** Which parts are done. */
	const doneMap = $derived<Record<string, boolean>>({ quiz: progress.quizDone(chapter), play: progress.playDone(chapter), lab: progress.labDone(chapter) });
	/** The next part still to do, looking forward first, then back; null when all done. */
	const nextTab = $derived.by(() => {
		const i = tabs.indexOf(tab);
		return tabs.slice(i + 1).find((t) => !doneMap[t]) ?? tabs.slice(0, i).find((t) => !doneMap[t]) ?? null;
	});
	const nextLabel = $derived(nextTab ? `Next: ${NAMES[nextTab]}` : nextChapterLabel);

	let tabsEl: HTMLElement | undefined = $state();

	async function setTab(t: string) {
		await goto(`#/ch/${chapter.n}/${t}`, { replaceState: true, noScroll: true, keepFocus: true });
		await tick();
		tabsEl?.scrollIntoView({ block: 'start', behavior: 'smooth' });
	}
	function nextPart() {
		if (nextTab) setTab(nextTab);
		else goto(nextChapterHref);
	}
	setContext('nextPart', {
		get go() {
			return nextPart;
		},
		get label() {
			return nextLabel;
		}
	});
</script>

<svelte:head><title>Chapter {chapter.n}: {chapter.title} · Neha’s stratigraphic column</title></svelte:head>

{#key chapter.n}
	<article class="grid max-w-[64rem] grid-cols-[minmax(0,1fr)] gap-6">
		<header class="grid gap-1">
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-malachite text-sm font-semibold">Chapter {chapter.n}</span>
				{#if deposited}<Badge variant="malachite">Deposited</Badge>{/if}
			</div>
			<h1 class="font-serif text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{chapter.title}</h1>
			<p class="text-muted-foreground">{chapter.blurb} <a href={bookLink(chapter.n)} target="_blank" rel="noopener" class="inline-flex items-center gap-1"><BookOpen class="size-3.5" /> Read it in the book</a>.</p>
		</header>

		{#if deposited}
			<PartDone deposited title="Layer deposited." detail="Assessment, playground and lab all complete." nextLabel={nextChapterLabel} href={nextChapterHref} />
		{/if}

		<div bind:this={tabsEl} class="scroll-mt-4"></div>
		<Tabs.Root value={tab} onValueChange={(v) => setTab(v)}>
			<Tabs.List>
				<Tabs.Trigger value="quiz"><ListChecks /> <span class="max-sm:hidden">Assessment</span><span class="sm:hidden">Quiz</span> {#if doneMap.quiz}<CircleCheck class="text-malachite size-3.5!" aria-label="passed" />{/if}</Tabs.Trigger>
				{#if chapter.play}<Tabs.Trigger value="play"><Joystick /> <span class="max-sm:hidden">Playground</span><span class="sm:hidden">Play</span> {#if doneMap.play}<CircleCheck class="text-malachite size-3.5!" aria-label="done" />{:else}<span class="text-muted-foreground text-xs">{progress.playCount(chapter)}/{chapter.play.missions.length}</span>{/if}</Tabs.Trigger>{/if}
				<Tabs.Trigger value="lab"><Laptop /> <span class="max-sm:hidden">On your computer</span><span class="sm:hidden">Your PC</span> {#if doneMap.lab}<CircleCheck class="text-malachite size-3.5!" aria-label="done" />{/if}</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="quiz" class="grid max-w-3xl gap-5">
				{#if doneMap.quiz && !deposited}
					<PartDone title={`Assessment passed, best score ${progress.get(chapter.n).quizBest} of 5.`} detail="You can retake it any time." {nextLabel} onnext={nextPart} />
				{/if}
				<Quiz {chapter} onlab={nextPart} />
			</Tabs.Content>

			{#if chapter.play && Play}
				<Tabs.Content value="play" class="grid gap-5">
					<p class="text-muted-foreground max-w-3xl">{chapter.play.intro}</p>
					{#if doneMap.play && !deposited}
						<PartDone title="Playground complete." detail="Every mission is done. Keep playing, or move to the next part." {nextLabel} onnext={nextPart} />
					{/if}
					<Play />
					{#if doneMap.play}
						{#if deposited}
							<PartDone title="Playground complete." nextLabel={nextChapterLabel} href={nextChapterHref} />
						{:else}
							<PartDone title="Playground complete." {nextLabel} onnext={nextPart} />
						{/if}
					{/if}
				</Tabs.Content>
			{/if}

			<Tabs.Content value="lab" class="grid max-w-3xl gap-5">
				{#if doneMap.lab && !deposited}
					<PartDone title="Lab complete." detail={`Still to do: ${tabs.filter((t) => !doneMap[t]).map((t) => NAMES[t]).join(', ')}.`} {nextLabel} onnext={nextPart} />
				{/if}
				<OnComputer {chapter} />
				{#if doneMap.lab}
					{#if deposited}
						<PartDone deposited title="Lab complete. Layer deposited." nextLabel={nextChapterLabel} href={nextChapterHref} />
					{:else}
						<PartDone title="Lab complete." {nextLabel} onnext={nextPart} />
					{/if}
				{/if}
			</Tabs.Content>
		</Tabs.Root>

		<nav class="border-border flex justify-between gap-3 border-t-[1.5px] pt-5" aria-label="Chapter navigation">
			{#if prev}<Button variant="ghost" class="h-auto min-h-9 min-w-0 shrink whitespace-normal" href={`#/ch/${prev.n}`}><ArrowLeft /> {prev.n}. {prev.short}</Button>{:else}<span></span>{/if}
			{#if next}<Button variant="ghost" class="h-auto min-h-9 min-w-0 shrink whitespace-normal text-right" href={`#/ch/${next.n}`}>{next.n}. {next.short} <ArrowRight /></Button>{/if}
		</nav>
	</article>
{/key}
