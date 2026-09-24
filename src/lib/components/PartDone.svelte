<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { CircleCheck, ArrowRight, Layers } from '@lucide/svelte';

	let {
		title,
		detail = '',
		nextLabel,
		onnext,
		href,
		deposited = false,
		class: className = ''
	}: { title: string; detail?: string; nextLabel?: string; onnext?: () => void; href?: string; deposited?: boolean; class?: string } = $props();
</script>

<div class={cn('border-malachite bg-malachite-soft flex flex-wrap items-center justify-between gap-3 rounded-lg border-[1.5px] px-4 py-3', className)} role="status">
	<div class="flex items-start gap-2.5">
		{#if deposited}<Layers class="text-malachite mt-0.5 size-5 shrink-0" />{:else}<CircleCheck class="text-malachite mt-0.5 size-5 shrink-0" />{/if}
		<div>
			<strong>{title}</strong>
			{#if detail}<span class="text-muted-foreground block text-sm">{detail}</span>{/if}
		</div>
	</div>
	{#if nextLabel && (onnext || href)}
		<Button variant="malachite" size="sm" onclick={onnext} {href}>{nextLabel} <ArrowRight /></Button>
	{/if}
</div>
