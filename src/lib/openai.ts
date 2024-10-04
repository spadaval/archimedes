import { OpenAI } from 'openai'; // Assuming you have an OpenAI client imported
import { APIError } from 'openai'; // Import the APIError type if needed
import { getSettings } from './settings.svelte';
import type { ChatCompletion, ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { Stream } from 'openai/streaming';

export async function callOpenAISync(messages: ChatCompletionMessageParam[]): Promise<ChatCompletion> {
	return callOpenAI(messages, false) as unknown as Promise<ChatCompletion>;
}

export async function callOpenAIStream(messages: ChatCompletionMessageParam[]): Promise<Stream<ChatCompletionChunk>> {
	return callOpenAI(messages, true) as unknown as Promise<Stream<ChatCompletionChunk>>;
}

async function callOpenAI(
	messages: ChatCompletionMessageParam[],
	stream: boolean = true
): Promise<ReturnType<OpenAI['chat']['completions']['create']>> {
	let client = new OpenAI({
		baseURL: getSettings().base_url,
		apiKey: getSettings().api_key,
		dangerouslyAllowBrowser: true
	});

	/**
	 * Calls the OpenAI API with provided messages and handles potential errors.
	 */
	try {
		console.log(`Calling OpenAI with model: ${getSettings().model}`);
		// API call to OpenAI
		const completion = await client.chat.completions.create({
			model: getSettings().model,
			messages: messages,
			temperature: getSettings().temperature,
			max_completion_tokens: 2000,
			max_tokens: 2000,
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
): ChatCompletionMessageParam[] {
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
