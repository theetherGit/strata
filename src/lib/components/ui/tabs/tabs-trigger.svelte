<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	let { ref = $bindable(null), class: className, ...restProps }: TabsPrimitive.TriggerProps = $props();
</script>
<TabsPrimitive.Trigger
	bind:ref
	class={cn(
		'text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_-3px_0_0_var(--foreground)] inline-flex cursor-pointer items-center gap-2 px-3 py-2.5 text-[0.95rem] font-medium whitespace-nowrap outline-none focus-visible:ring-[3px] [&_svg]:size-4',
		className
	)}
	{...restProps}
/>
