<script lang="ts">
	import type { Chapter } from '$lib/data/chapters';
	import { progress } from '$lib/progress.svelte';
	import { Progress } from '$lib/components/ui/progress';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { CircleCheck, Circle, ArrowRight, Lightbulb, Eye } from '@lucide/svelte';
	import { getContext } from 'svelte';

	let { chapter, attempts = 0, class: className = '' }: { chapter: Chapter; attempts?: number; class?: string } = $props();
	const missions = $derived(chapter.play?.missions ?? []);
	const done = $derived(progress.playCount(chapter));
	const next = getContext<{ go: () => void; label: string } | undefined>('nextPart');
	/** The first mission not yet done: the one hints are offered for. */
	const current = $derived(missions.find((m) => !progress.get(chapter.n).play[m.id]));
	let showHint = $state(false);
	let showReveal = $state(false);
	$effect(() => {
		current?.id;
		showHint = false;
		showReveal = false;
	});
</script>

<div class={cn('bg-card rounded-lg border-[1.5px] p-4', className)}>
	<div class="mb-2 flex items-baseline justify-between gap-3">
		<h3 class="font-serif text-lg font-semibold">Missions</h3>
		<span class="text-muted-foreground text-sm">{done} of {missions.length}</span>
	</div>
	<Progress value={done} max={missions.length || 1} class="mb-3" />
	<ul class="grid gap-2" aria-live="polite">
		{#each missions as m (m.id)}
			{@const ok = progress.get(chapter.n).play[m.id]}
			{@const isCurrent = current?.id === m.id}
			<li class={cn('flex items-start gap-2 text-[0.93rem]', ok ? 'text-foreground' : isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground')}>
				{#if ok}<CircleCheck class="text-malachite mt-0.5 size-4 shrink-0" aria-label="done" />{:else}<Circle class={cn('mt-0.5 size-4 shrink-0', isCurrent && 'text-ochre')} aria-label={isCurrent ? 'current' : 'not done'} />{/if}
				<span class={cn(ok && 'decoration-malachite/50 line-through decoration-1')}>{m.text}</span>
			</li>
		{/each}
	</ul>
	{#if current?.hint}
		<div class="border-border mt-3 grid gap-2 border-t-[1.5px] pt-3">
			<div class="flex flex-wrap gap-2">
				<Button variant="ghost" size="sm" class="text-muted-foreground h-7 px-2" onclick={() => (showHint = !showHint)} aria-expanded={showHint}><Lightbulb /> {showHint ? 'Hide hint' : 'Hint'}</Button>
				{#if current.reveal && (attempts >= 3 || showReveal)}
					<Button variant="ghost" size="sm" class="text-muted-foreground h-7 px-2" onclick={() => (showReveal = !showReveal)} aria-expanded={showReveal}><Eye /> {showReveal ? 'Hide' : 'Show me'}</Button>
				{/if}
			</div>
			{#if showHint}<p class="text-sm">{current.hint}</p>{/if}
			{#if showReveal && current.reveal}<p class="text-sm">Type: <code>{current.reveal}</code></p>{/if}
			{#if current.reveal && attempts > 0 && attempts < 3 && !showReveal}<p class="text-muted-foreground text-xs">“Show me” appears after {3 - attempts} more tr{3 - attempts === 1 ? 'y' : 'ies'}.</p>{/if}
		</div>
	{/if}
	{#if missions.length && done === missions.length}
		<div class="border-malachite mt-3 border-t-[1.5px] pt-3">
			<p class="text-malachite mb-2 text-sm font-semibold">All missions done.</p>
			{#if next}<Button variant="malachite" size="sm" class="w-full" onclick={next.go}>{next.label} <ArrowRight /></Button>{/if}
		</div>
	{/if}
</div>
