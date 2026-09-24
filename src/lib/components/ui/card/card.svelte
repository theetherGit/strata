<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	let { ref = $bindable(null), class: className, children, ...restProps }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>
<div bind:this={ref} class={cn('bg-card text-card-foreground flex min-w-0 flex-col gap-4 rounded-xl border-[1.5px] py-5', className)} {...restProps}>
	{@render children?.()}
</div>
