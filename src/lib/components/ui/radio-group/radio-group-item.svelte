<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	let { ref = $bindable(null), class: className, ...restProps }: RadioGroupPrimitive.ItemProps = $props();
</script>
<RadioGroupPrimitive.Item
	bind:ref
	class={cn('border-foreground/60 focus-visible:ring-ring/60 data-[state=checked]:border-malachite aspect-square size-4 shrink-0 rounded-full border-[1.5px] outline-none focus-visible:ring-[3px] disabled:opacity-50', className)}
	{...restProps}
>
	{#snippet children({ checked })}
		<div class="flex items-center justify-center">
			{#if checked}<span class="bg-malachite block size-2 rounded-full"></span>{/if}
		</div>
	{/snippet}
</RadioGroupPrimitive.Item>
