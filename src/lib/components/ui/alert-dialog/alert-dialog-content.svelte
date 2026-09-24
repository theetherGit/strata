<script lang="ts">
	import { AlertDialog as P } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	let { ref = $bindable(null), class: className, children, ...restProps }: P.ContentProps = $props();
</script>
<P.Portal>
	<P.Overlay class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/45" />
	<P.Content
		bind:ref
		class={cn('bg-card data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border-[1.5px] p-6 shadow-lg', className)}
		{...restProps}
	>
		{@render children?.()}
	</P.Content>
</P.Portal>
