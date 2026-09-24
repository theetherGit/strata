<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';
	let { ref = $bindable(null), value = $bindable(), class: className, ...restProps }: WithElementRef<HTMLInputAttributes> = $props();
</script>
<input
	bind:this={ref}
	bind:value
	class={cn('bg-background border-input placeholder:text-muted-foreground focus-visible:ring-ring/50 focus-visible:border-ring flex h-9 w-full min-w-0 rounded-md border-[1.5px] px-3 py-1 font-mono text-[0.92rem] outline-none focus-visible:ring-[3px] disabled:opacity-50', className)}
	{...restProps}
/>
