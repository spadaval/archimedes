<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import Input from '$lib/components/ui/input/input.svelte';
	import { onMount } from 'svelte';
	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
	interface Query {
		userQuery: string;
		thoughtProcess: string | null;
		iteration: number;
		response: string | null;
	}

	let chatHistory = $state<Query[]>([]);

	onMount(() => {
		const storedChatHistory = localStorage.getItem('chatHistory');
		chatHistory = JSON.parse(storedChatHistory || '[]');
	});

	$effect(() => {
		localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
	});

	let userMessage = $state('');

	async function getThoughtProcess(query: Query) {
		await delay(1000);
		query.thoughtProcess = 'Thought process';
		query.iteration++;
	}

	function handleSubmit(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			chatHistory.push({
				userQuery: userMessage,
				thoughtProcess: null,
				iteration: 0,
				response: null
			});
			userMessage = '';
			getThoughtProcess(chatHistory[chatHistory.length - 1]);
		}
	}
</script>

<div class="flex flex-col items-center p-10">
	{#each chatHistory as query}
		<div class="flex w-1/2 flex-row items-center justify-end text-white">
			<div class="m-4 w-72 rounded-3xl bg-zinc-800 p-4 text-white outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0">
				{query.userQuery}
			</div>
			<Avatar><AvatarFallback class="bg-blue-500">You</AvatarFallback></Avatar>
		</div>
		<div class="flex w-1/2 flex-row items-center justify-start text-white">
			<Avatar><AvatarFallback class="bg-red-500">AI</AvatarFallback></Avatar>
			<div class="m-4 w-72 rounded-3xl p-4 text-white outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0">
				<div class="text-sm uppercase text-zinc-400">Thought Process</div>
				{query.thoughtProcess}
			</div>
		</div>
	{/each}
</div>

<div class="absolute bottom-4 left-4 right-4 flex w-full flex-row items-center justify-center">
	<input
		bind:value={userMessage}
		onkeypress={handleSubmit}
		type="text"
		placeholder="Type your message..."
		class=" m-4 h-12 w-1/2 rounded-3xl bg-zinc-800 p-6 pl-10 text-white outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0"
	/>
</div>
