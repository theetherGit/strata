<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	let { ref = $bindable(null), value = $bindable(''), class: className, ...restProps }: TabsPrimitive.RootProps = $props();
</script>
<TabsPrimitive.Root bind:ref bind:value class={cn('flex min-w-0 flex-col gap-5', className)} {...restProps} />
