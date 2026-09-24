<script lang="ts">
	import type { Chapter, Q } from '$lib/data/chapters';
	import { progress } from '$lib/progress.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { Check, X, RotateCcw, FlaskConical } from '@lucide/svelte';

	let { chapter, onlab, questions, record = true }: { chapter: Chapter; onlab?: () => void; questions?: Q[]; record?: boolean } = $props();
	const qs = $derived(questions ?? chapter.quiz);
	// svelte-ignore state_referenced_locally
	let picks = $state<string[]>(qs.map(() => ''));
	let submitted = $state(false);
	let attempt = $state(0);


	const score = $derived(qs.filter((q, i) => picks[i] === String(q.a)).length);
	const answered = $derived(picks.filter(Boolean).length);

	function submit() {
		submitted = true;
		if (record) progress.setQuiz(chapter.n, score, score >= 4);
	}
	function retry() {
		picks = qs.map(() => '');
		submitted = false;
		attempt++;
	}
</script>

{#key attempt}
	<form
		class="grid gap-7"
		onsubmit={(e) => {
			e.preventDefault();
			if (answered === qs.length) submit();
		}}
	>
		{#each qs as q, i}
			<fieldset class="grid gap-2.5">
				<legend class="mb-2.5 font-semibold leading-snug"><span class="text-muted-foreground mr-1.5 font-medium">{i + 1}.</span>{q.q}</legend>
				<RadioGroup.Root bind:value={picks[i]} disabled={submitted} class="gap-1.5">
					{#each q.o as o, j}
						{@const isRight = submitted && j === q.a}
						{@const isWrong = submitted && picks[i] === String(j) && j !== q.a}
						<label
							class={cn(
								'bg-card flex cursor-pointer items-start gap-3 rounded-lg border-[1.5px] px-3.5 py-2.5 transition-colors',
								!submitted && 'hover:border-foreground/50 has-[[data-state=checked]]:border-foreground',
								isRight && 'border-malachite bg-malachite-soft',
								isWrong && 'border-hematite bg-hematite-soft'
							)}
						>
							<RadioGroup.Item value={String(j)} class="mt-1" />
							<span class="flex-1">{o}</span>
							{#if isRight}<Check class="text-malachite mt-0.5 size-4" aria-label="Correct answer" />{/if}
							{#if isWrong}<X class="text-hematite mt-0.5 size-4" aria-label="Your answer, incorrect" />{/if}
						</label>
					{/each}
				</RadioGroup.Root>
				{#if submitted}
					<p class={cn('border-l-[3px] pl-3 text-[0.94rem]', picks[i] === String(q.a) ? 'border-malachite' : 'border-hematite')}>
						<strong>{picks[i] === String(q.a) ? 'Correct.' : 'Not quite.'}</strong>
						{q.e}
					</p>
				{/if}
			</fieldset>
		{/each}

		<div aria-live="polite" class="grid gap-3">
			{#if !submitted}
				<div class="flex flex-wrap items-center gap-3">
					<Button type="submit" disabled={answered < qs.length}>Check answers</Button>
					<span class="text-muted-foreground text-sm">
						{answered < qs.length ? `${qs.length - answered} left to answer` : 'Ready'}
						{#if record && progress.get(chapter.n).quizBest}· best so far {progress.get(chapter.n).quizBest} of 5{/if}
					</span>
				</div>
			{:else}
				<div class={cn('rounded-lg border-[1.5px] p-4', score >= 4 ? 'border-malachite bg-malachite-soft' : 'bg-card')}>
					<p class="font-serif text-2xl font-semibold">{score} of {qs.length}</p>
					<p>{record ? (score >= 4 ? 'Passed. Nice work.' : 'You need 4 of 5 to pass. Read the explanations above, then try again.') : score >= 4 ? 'Still solid.' : 'Worth re-reading those chapters.'}</p>
				</div>
				<div class="flex flex-wrap gap-2">
					<Button variant="outline" onclick={retry}><RotateCcw /> Try again</Button>
					{#if score >= 4 && onlab}<Button variant="malachite" onclick={onlab}><FlaskConical /> Next part</Button>{/if}
				</div>
			{/if}
		</div>
	</form>
{/key}
