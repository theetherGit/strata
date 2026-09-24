<script lang="ts">
	import type { DirNode, Node } from '$lib/sim/fs';
	import { cn } from '$lib/utils';
	import { Folder, FolderOpen, FileText, MapPin } from '@lucide/svelte';

	let {
		root,
		cwd,
		tick = 0,
		start = [] as string[],
		onpick,
		highlight = null as string[] | null,
		showHidden = false
	}: { root: DirNode; cwd: string[]; tick?: number; start?: string[]; onpick?: (p: string[]) => void; highlight?: string[] | null; showHidden?: boolean } = $props();

	const eq = (a: string[], b: string[] | null) => !!b && a.length === b.length && a.every((x, i) => x.toLowerCase() === b[i].toLowerCase());
	const onPath = (p: string[]) => cwd.length >= p.length && p.every((x, i) => x.toLowerCase() === cwd[i]?.toLowerCase());

	function sorted(d: DirNode): Node[] {
		tick;
		return [...d.children.values()].filter((k) => showHidden || !(k.type === 'dir' && k.hidden)).sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
	}
	function nodeAt(p: string[]): DirNode {
		let cur: DirNode = root;
		for (const s of p) cur = cur.children.get(s.toLowerCase()) as DirNode;
		return cur;
	}
</script>

{#snippet branch(d: DirNode, path: string[], depth: number)}
	<ul class={cn(depth > 0 && 'border-border ml-[0.6rem] border-l pl-2')}>
		{#each sorted(d) as n (n.name)}
			{@const p = [...path, n.name]}
			<li>
				{#if n.type === 'dir'}
					{@const here = eq(p, cwd)}
					<button
						type="button"
						disabled={!onpick}
						onclick={() => onpick?.(p)}
						class={cn(
							'flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left disabled:cursor-default',
							onpick && 'hover:bg-accent cursor-pointer',
							here && 'bg-malachite-soft text-malachite font-semibold',
							eq(p, highlight) && 'ring-lapis ring-2'
						)}
						aria-label={`${n.name} folder${here ? ', you are here' : ''}`}
					>
						{#if onPath(p)}<FolderOpen class="size-4 shrink-0" />{:else}<Folder class="size-4 shrink-0" />{/if}
						<span class="truncate">{n.name}</span>
						{#if here}<MapPin class="ml-auto size-3.5 shrink-0" aria-hidden="true" />{/if}
					</button>
					{#if n.children.size && (onPath(p) || depth < 1 || eq(p, highlight?.slice(0, p.length) ?? null))}
						{@render branch(n, p, depth + 1)}
					{:else if n.children.size}
						<ul class="border-border ml-[0.6rem] border-l pl-2"><li class="text-muted-foreground px-1.5 text-xs">{n.children.size} item{n.children.size > 1 ? 's' : ''}</li></ul>
					{/if}
				{:else}
					<div class={cn('flex items-center gap-1.5 rounded px-1.5 py-0.5', eq(p, highlight) && 'bg-lapis/15 ring-lapis font-semibold ring-2')}>
						<FileText class="text-muted-foreground size-4 shrink-0" />
						<span class="truncate">{n.name}</span>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<div class="font-mono text-[0.82rem] leading-relaxed">
	{#if start.length}
		<div class="text-muted-foreground mb-1 px-1.5">C:\{start.join('\\')}</div>
		{@render branch(nodeAt(start), start, 0)}
	{:else}
		<div class="text-muted-foreground mb-1 px-1.5">C:\</div>
		{@render branch(root, [], 0)}
	{/if}
</div>
