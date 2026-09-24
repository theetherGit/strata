<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';
	export const badgeVariants = tv({
		base: 'inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold [&>svg]:size-3',
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground border-transparent',
				malachite: 'bg-malachite-soft text-malachite border-malachite/40',
				ochre: 'bg-ochre-soft text-ochre border-ochre/40',
				hematite: 'bg-hematite-soft text-hematite border-hematite/40',
				outline: 'text-foreground'
			}
		},
		defaultVariants: { variant: 'default' }
	});
	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>
<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	let { ref = $bindable(null), class: className, variant = 'default', children, ...restProps }: WithElementRef<HTMLAttributes<HTMLSpanElement>> & { variant?: BadgeVariant } = $props();
</script>
<span bind:this={ref} class={cn(badgeVariants({ variant }), className)} {...restProps}>{@render children?.()}</span>
