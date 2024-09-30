import { onMount } from 'svelte';

let defaultSettings = {
	base_url: '',
	api_key: '',
	model: '',
	temperature: 0.2,
	max_tokens: 1024,
	top_p: 1,
	frequency_penalty: 0
};

export let settings = $state(defaultSettings);

onMount(() => {
	settings = localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings')!) : defaultSettings;
});

$effect(() => {
	localStorage.setItem('settings', JSON.stringify(settings));
});
