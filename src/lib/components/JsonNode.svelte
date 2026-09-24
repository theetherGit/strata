<script lang="ts">
	import JsonNode from './JsonNode.svelte';
	import { cn } from '$lib/utils';
	import { ChevronRight } from '@lucide/svelte';

	let { value, path, label, onpick, selected, depth = 0 }: { value: unknown; path: (string | number)[]; label: string; onpick: (p: (string | number)[], v: unknown) => void; selected: string; depth?: number } = $props();
	const isObj = $derived(value !== null && typeof value === 'object');
	let open = $derived(depth < 2);
	const key = $derived(JSON.stringify(path));
	const entries = $derived(isObj ? (Array.isArray(value) ? value.map((v, i) => [i, v] as [number, unknown]) : Object.entries(value as object)) : []);
	const preview = (v: unknown) => (typeof v === 'string' ? `"${v}"` : String(v));
</script>

<li>
	<div class={cn('flex items-center gap-1 rounded px-1', selected === key && 'bg-lapis/15 ring-lapis ring-1')}>
		{#if isObj}
			<button type="button" onclick={() => (open = !open)} aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${label}`} class="hover:bg-accent cursor-pointer rounded p-0.5">
				<ChevronRight class={cn('size-3.5 transition-transform', open && 'rotate-90')} />
			</button>
		{:else}<span class="w-[1.1rem]"></span>{/if}
		<button type="button" onclick={() => onpick(path, value)} class="hover:text-lapis cursor-pointer text-left">
			<span class="text-lapis">{label}</span>
			{#if isObj}
				<span class="text-muted-foreground">{Array.isArray(value) ? `[ ${entries.length} items ]` : '{ … }'}</span>
			{:else}
				: <span class={typeof value === 'number' ? 'text-malachite' : 'text-ochre'}>{preview(value)}</span>
			{/if}
		</button>
	</div>
	{#if isObj && open}
		<ul class="border-border ml-2 border-l pl-3">
			{#each entries as [k, v] (k)}
				<JsonNode value={v} path={[...path, k]} label={typeof k === 'number' ? `[${k}]` : `"${k}"`} {onpick} {selected} depth={depth + 1} />
			{/each}
		</ul>
	{/if}
</li>
