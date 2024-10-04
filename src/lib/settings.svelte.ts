import { browser } from '$app/environment';
import { Store } from 'runed';
import { writable } from 'svelte/store';

let defaultSettings = {
	base_url: 'http://localhost:5001/v1',
	api_key: 'blargh',
	model: 'blargh',
	temperature: 0.2,
	max_tokens: 1024,
	top_p: 1,
	frequency_penalty: 0
};

export let settings = writable(defaultSettings);

if (browser) {
	//settings.set(localStorage.getItem('settings') ? JSON.parse(localStorage.getItem('settings')!) : defaultSettings);
}

settings.subscribe((value) => {
	if (browser) {
		localStorage.setItem('settings', JSON.stringify(value));
	}
});

let _settings = defaultSettings;

settings.subscribe((value) => {
	_settings = value;
});

export function getSettings() {
	return _settings;
}
