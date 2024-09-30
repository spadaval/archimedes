import { OpenAI } from 'openai'; // Assuming you have an OpenAI client imported
import { APIError } from 'openai'; // Import the APIError type if needed
import { settings } from './settings.svelte';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export async function callOpenAI(
	messages: ChatCompletionMessageParam[],
	stream: boolean = true
): Promise<ReturnType<OpenAI['chat']['completions']['create']>> {
	let client = new OpenAI({
		apiKey: settings.api_key
	});

	/**
	 * Calls the OpenAI API with provided messages and handles potential errors.
	 */
	try {
		console.log(`Calling OpenAI with model: ${settings.model}`);
		// API call to OpenAI
		const completion = await client.chat.completions.create({
			model: settings.model,
			messages: messages,
			temperature: settings.temperature,
			stream: stream
		});
		return completion;
	} catch (e) {
		if (e instanceof APIError) {
			console.error(`OpenAI API Error: ${e.message}`);
			return Promise.reject({ error: e.message });
		} else {
			console.error(`Unexpected error in callOpenAI: ${e}`);
			return Promise.reject({ error: e });
		}
	}
}

export function prepareMessages(
	chatHistory: { sender: string; text: string }[],
	userMessage: string,
	systemPrompt: string,
	thoughtProcess?: string
): any[] {
	/**
	 * Prepares the message payload for OpenAI API by organizing chat history and appending the latest user input.
	 */
	const messages: ChatCompletionMessageParam[] = [];
	const historyLimit = 10;
	const recentHistory = chatHistory.slice(-historyLimit);

	for (const entry of recentHistory) {
		if (entry.sender === 'user') {
			messages.push({ role: 'user', content: entry.text });
		} else if (entry.sender === 'assistant') {
			messages.push({ role: 'assistant', content: entry.text });
		}
	}

	if (thoughtProcess) {
		systemPrompt += `\n\nPrevious thought process:\n${thoughtProcess}`;
	}

	messages.push({ role: 'system', content: systemPrompt });
	messages.push({ role: 'user', content: userMessage });

	return messages;
}
