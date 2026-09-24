<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.ListProps = $props();
</script>
<TabsPrimitive.List bind:ref class={cn('border-border flex w-full gap-1 overflow-x-auto overflow-y-hidden border-b-[1.5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)} {...restProps} />
