<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';
	import { Eye } from '@lucide/svelte';

	export type PCard = { code: string; answer: string; accept?: string[]; e: string };
	let { cards, onreveal }: { cards: PCard[]; onreveal?: (i: number, ok: boolean) => void } = $props();
	// The cards are fixed for the life of the component; these arrays are mutated by index as she plays, so they must be $state.
	// svelte-ignore state_referenced_locally
	let guesses = $state<string[]>(cards.map(() => ''));
	// svelte-ignore state_referenced_locally
	let shown = $state<boolean[]>(cards.map(() => false));
	const norm = (s: string) => s.trim().replace(/^["']|["']$/g, '').toLowerCase();
	const ok = (i: number) => [cards[i].answer, ...(cards[i].accept ?? [])].some((a) => norm(a) === norm(guesses[i]));
	function reveal(i: number) {
		if (!guesses[i].trim()) return;
		shown[i] = true;
		onreveal?.(i, ok(i));
	}
</script>

<div class="grid gap-4 md:grid-cols-2">
	{#each cards as c, i}
		<div class={cn('bg-card grid content-start gap-3 rounded-lg border-[1.5px] p-4', shown[i] && (ok(i) ? 'border-malachite' : 'border-ochre'))}>
			<div class="text-muted-foreground text-xs font-medium">Card {i + 1} · what does this print?</div>
			<pre class="my-0">{c.code}</pre>
			<form class="flex gap-2" onsubmit={(e) => { e.preventDefault(); reveal(i); }}>
				<Input bind:value={guesses[i]} disabled={shown[i]} placeholder="Your prediction" aria-label={`Prediction for card ${i + 1}`} />
				<Button type="submit" variant="outline" disabled={shown[i] || !guesses[i].trim()}><Eye /> Reveal</Button>
			</form>
			{#if shown[i]}
				<div aria-live="polite" class="text-sm">
					<p class="mb-1"><strong class={ok(i) ? 'text-malachite' : 'text-ochre'}>{ok(i) ? 'You predicted it.' : 'Surprise!'}</strong> Python prints <code>{c.answer}</code>.</p>
					<p>{c.e}</p>
				</div>
			{/if}
		</div>
	{/each}
</div>
