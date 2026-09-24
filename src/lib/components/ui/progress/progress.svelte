<script lang="ts">
	import { Progress as ProgressPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	let { ref = $bindable(null), class: className, max = 100, value, ...restProps }: ProgressPrimitive.RootProps = $props();
</script>
<ProgressPrimitive.Root bind:ref class={cn('bg-muted relative h-2 w-full overflow-hidden rounded-full', className)} {value} {max} {...restProps}>
	<div class="bg-malachite h-full w-full flex-1 transition-transform duration-500" style={`transform: translateX(-${100 - (100 * (value ?? 0)) / (max ?? 1)}%)`}></div>
</ProgressPrimitive.Root>
