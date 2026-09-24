<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { RotateCcw, Eraser } from '@lucide/svelte';

	let { onrestart, onreset }: { onrestart: () => void; onreset: () => void } = $props();
	let open = $state(false);
</script>

<div class="flex flex-wrap items-center justify-end gap-2">
	<Button variant="outline" size="sm" onclick={onrestart}><RotateCcw /> New terminal window</Button>
	<AlertDialog.Root bind:open>
		<AlertDialog.Trigger class={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' text-muted-foreground'}><Eraser /> Reset the pretend drive</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Title class="font-serif text-xl font-semibold">Reset the pretend drive?</AlertDialog.Title>
			<AlertDialog.Description class="text-muted-foreground">This wipes every file, package and commit you made in this playground and starts it as new. Your ticked missions stay ticked. A new terminal window keeps your files; use that if you only want a clear screen.</AlertDialog.Description>
			<div class="flex justify-end gap-2">
				<AlertDialog.Cancel class={buttonVariants({ variant: 'outline' })}>Keep my files</AlertDialog.Cancel>
				<AlertDialog.Action class={buttonVariants({ variant: 'destructive' })} onclick={() => { open = false; onreset(); }}>Reset the drive</AlertDialog.Action>
			</div>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
