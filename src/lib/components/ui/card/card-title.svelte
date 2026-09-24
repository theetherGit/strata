<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	let { ref = $bindable(null), class: className, children, ...restProps }: WithElementRef<HTMLAttributes<HTMLHeadingElement>> = $props();
</script>
<h3 bind:this={ref} class={cn('font-serif text-xl leading-tight font-semibold', className)} {...restProps}>{@render children?.()}</h3>
