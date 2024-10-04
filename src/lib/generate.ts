import { prepareMessages, callOpenAIStream } from './openai';
import { getThoughtProcessPrompt } from './prompts';
import type { Query } from './types';

export async function generateThoughtProcess(query: Query) {
	let systemPrompt = getThoughtProcessPrompt(query.thoughts.length);
	const messages = prepareMessages([], query.userQuery, systemPrompt);
	const response = await callOpenAIStream(messages);

	query.thoughts.push('');
	for await (const chunk of response) {
		let content = chunk.choices[0].delta.content;
		if (content) {
			query.thoughts[query.thoughts.length - 1] += content;
		}
	}
	console.log(query.thoughts[query.thoughts.length - 1]);
}

export async function regenerateThoughtProcess(query: Query) {
	if (query.thoughts.length > 0) {
		query.thoughts.pop();
	}
	return await generateThoughtProcess(query);
}

export async function getFinalAnswer(query: Query) {
	query.response = 'Final answer';
}
