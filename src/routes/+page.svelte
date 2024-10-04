<script lang="ts">
	import ThoughtProcess from '$lib/components/thought-process.svelte';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { generateThoughtProcess } from '$lib/generate';
	import { callOpenAIStream, prepareMessages } from '$lib/openai';
	import { getThoughtProcessPrompt } from '$lib/prompts';
	import { Copy, RefreshCcw, Trash } from 'lucide-svelte';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { Query } from '$lib/types';
	let chatHistory = $state<Query[]>([]);

	onMount(() => {
		const storedChatHistory = localStorage.getItem('chatHistory');
		chatHistory = JSON.parse(storedChatHistory || '[]');
	});

	$effect(() => {
		localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
	});

	let userMessage = $state('');

	export function submitQuery(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			chatHistory.push({
				userQuery: userMessage,
				thoughts: [],
				response: null
			});
			userMessage = '';
			generateThoughtProcess(chatHistory[chatHistory.length - 1]);
		}
	}
	let v = $state('0');
</script>

<div class="flex h-full w-full flex-col">
	<div class="flex flex-grow flex-col items-center overflow-scroll p-10">
		{#each chatHistory as query}
			<div class="flex w-1/2 flex-row items-center justify-end p-10 text-white">
				<div class="m-4 w-72 rounded-3xl bg-zinc-800 p-4 text-white outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0">
					{query.userQuery}
				</div>
				<Avatar><AvatarFallback class="bg-gray-500">You</AvatarFallback></Avatar>
			</div>
			<div class="flex  flex-row items-start justify-start p-10 text-white">
				<div class="m-4 mt-8"><Avatar><AvatarFallback class="bg-gray-500">AI</AvatarFallback></Avatar></div>
				<div class="w-full rounded-3xl p-4 text-white outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0">
					<Tabs.Root bind:value={v}>
						{v}
						<Tabs.List>
							{#each query.thoughts as thought, idx}
								<Tabs.Trigger value={idx.toString()}>COT #{idx}</Tabs.Trigger>
							{/each}
							{#if query.response}
								<Tabs.Trigger value="final">Final Answer</Tabs.Trigger>
							{/if}
						</Tabs.List>

						{#each query.thoughts as thought, idx}
							<Tabs.Content value={idx.toString()} >
								<ThoughtProcess {query} />
							</Tabs.Content>
						{/each}
						{#if query.response}
							<Tabs.Content value="final" >
								Final answer: {query.response}
							</Tabs.Content>
						{/if}
					</Tabs.Root>
				</div>
			</div>
		{/each}
	</div>

	<div class="flex w-full flex-row items-center justify-center">
		<input
			bind:value={userMessage}
			onkeypress={submitQuery}
			type="text"
			placeholder="What would you like to know?"
			class=" m-4 h-12 w-1/2 rounded-3xl bg-zinc-800 p-6 pl-10 text-white outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0"
		/>
		<button class="" onclick={() => (chatHistory = [])}>
			<Trash class="h-4 w-4 stroke-zinc-400" />
		</button>
	</div>
</div>


<style>
	* {
	overflow-anchor: none !important;
	scroll-snap-stop: normal !important;
	overscroll-behavior: unset !important;
	scroll-behavior: unset !important;
}

</style>