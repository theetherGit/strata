<script lang="ts">
	import { type Chapter, verify } from '$lib/data/chapters';
	import { progress } from '$lib/progress.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { CircleCheck, Lightbulb, Laptop } from '@lucide/svelte';

	let { chapter }: { chapter: Chapter } = $props();
	const saved = $derived(progress.get(chapter.n));
	// svelte-ignore state_referenced_locally
	let values = $state<Record<string, string>>(Object.fromEntries(chapter.lab.checks.map((k) => [k.id, saved.answers[k.id] ?? ''])));
	// svelte-ignore state_referenced_locally
	let feedback = $state<Record<string, 'ok' | 'no' | 'empty' | ''>>(Object.fromEntries(chapter.lab.checks.map((k) => [k.id, saved.checks[k.id] ? 'ok' : ''])));

	function run(id: string) {
		const k = chapter.lab.checks.find((x) => x.id === id)!;
		const v = values[id] ?? '';
		if (!v.trim()) {
			feedback[id] = 'empty';
			return;
		}
		const ok = verify(k, v);
		progress.setCheck(chapter.n, id, v, ok);
		feedback[id] = ok ? 'ok' : 'no';
	}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-6">
	<div class="bg-card flex items-start gap-3 rounded-lg border-[1.5px] p-4">
		<Laptop class="text-lapis mt-0.5 size-5 shrink-0" />
		<p><strong>On your own computer.</strong> {chapter.lab.goal}</p>
	</div>

	<section class="min-w-0">
		<h3 class="mb-3 font-serif text-xl font-semibold">Steps</h3>
		<ol class="marker:text-muted-foreground grid grid-cols-[minmax(0,1fr)] list-decimal gap-3 pl-6 marker:font-semibold">
			{#each chapter.lab.steps as st}
				<li class="pl-1 [&_pre]:my-2">{@html st}</li>
			{/each}
		</ol>
	</section>

	<section class="grid gap-3">
		<h3 class="font-serif text-xl font-semibold">Check your results</h3>
		{#each chapter.lab.checks as k (k.id)}
			<div class={cn('bg-card rounded-lg border-[1.5px] p-4', feedback[k.id] === 'ok' && 'border-malachite')}>
				<label for={`in-${chapter.n}-${k.id}`} class="mb-2 block font-medium">{k.label}</label>
				<div class="flex gap-2">
					<Input
						id={`in-${chapter.n}-${k.id}`}
						bind:value={values[k.id]}
						autocomplete="off"
						spellcheck={false}
						onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && run(k.id)}
						class={cn(feedback[k.id] === 'ok' && 'border-malachite')}
					/>
					<Button variant="outline" onclick={() => run(k.id)}>Check</Button>
				</div>
				<p class="mt-2 min-h-[1.4em] text-[0.93rem]" aria-live="polite">
					{#if feedback[k.id] === 'ok'}<span class="text-malachite inline-flex items-center gap-1.5 font-medium"><CircleCheck class="size-4" /> Correct.</span>
					{:else if feedback[k.id] === 'no'}<span class="text-hematite">Not what we expected. Re-run the step, or open the hint.</span>
					{:else if feedback[k.id] === 'empty'}<span class="text-hematite">Type what you saw first.</span>{/if}
				</p>
				<details class="text-muted-foreground text-sm">
					<summary class="inline-flex cursor-pointer items-center gap-1.5"><Lightbulb class="size-3.5" /> Hint</summary>
					<p class="mt-1.5">{k.hint}</p>
				</details>
			</div>
		{/each}
	</section>
</div>
