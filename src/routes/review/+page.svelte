<script lang="ts">
	import { CHAPTERS, type Q } from '$lib/data/chapters';
	import { progress } from '$lib/progress.svelte';
	import Quiz from '$lib/components/Quiz.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Shuffle } from '@lucide/svelte';

	const passed = $derived(CHAPTERS.filter((c) => progress.quizDone(c)));
	let round = $state(0);
	type RQ = Q & { from: number };
	function pick(): RQ[] {
		const pool: RQ[] = passed.flatMap((c) => c.quiz.map((q) => ({ ...q, from: c.n })));
		for (let i = pool.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[pool[i], pool[j]] = [pool[j], pool[i]];
		}
		return pool.slice(0, 5).map((q) => ({ ...q, q: `${q.q} (Chapter ${q.from})` }));
	}
	const questions = $derived.by(() => {
		round;
		return pick();
	});
</script>

<svelte:head><title>Review · Neha’s stratigraphic column</title></svelte:head>

<article class="grid max-w-3xl gap-6">
	<header class="grid gap-1">
		<div class="text-malachite text-sm font-semibold">Review</div>
		<h1 class="font-serif text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Five questions from your deposited layers</h1>
		<p class="text-muted-foreground">Mixed from the chapters whose assessments you have passed. Scores here are for you only; they don't change the column.</p>
	</header>
	{#if passed.length === 0}
		<p class="bg-card rounded-lg border-[1.5px] p-4">Pass at least one assessment first, then come back. <a href="#/ch/1">Start with Chapter 1</a>.</p>
	{:else}
		{#key round}
			<Quiz chapter={passed[0]} {questions} record={false} />
		{/key}
		<div><Button variant="outline" onclick={() => round++}><Shuffle /> Another five</Button></div>
	{/if}
</article>
