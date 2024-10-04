import { Stream } from 'openai/streaming.mjs';
import { callOpenAISync } from './openai';

const taskSpecificPrompts = {
	product_development: `
    You are an expert in product development. To ensure a clear, methodical thought process, follow these steps:
    1. Identify the core problem or need based on current market trends and user pain points.
    2. Explore and evaluate technological innovations that can address these needs.
    3. Develop potential solutions or products.
    4. Compare and contrast solutions by evaluating cost, feasibility, and potential market reception.
    5. Propose a final solution based on your analysis.
    `,
	scientific_research: `
    You are a seasoned scientist. To conduct a thorough thought process, use this structure:
    1. Clearly define the research question or hypothesis.
    2. Review and summarize existing literature to frame your hypothesis.
    3. Outline a detailed methodology, explaining the rationale behind each step.
    4. Consider potential variables, controls, and limitations.
    5. Predict potential outcomes and suggest next steps in research.
    `,
	creative_writing: `
    You are a creative writer. Use the following structure to guide your process:
    1. Define the core theme or emotion you want to explore.
    2. Introduce and develop the main character(s) with motivations, conflicts, and backstory.
    3. Outline the story arc, including the climax and resolution.
    4. Use literary devices (such as metaphor, symbolism, or foreshadowing) to enhance the narrative.
    5. Conclude by suggesting how the story reflects on or challenges the initial theme.
    `,
	general: `
    You are a knowledgeable assistant. To solve general problems or answer questions, follow these steps:
    1. Clarify the user's request and break it down into smaller parts if necessary.
    2. Present any background information or context that might be relevant.
    3. Explore multiple potential solutions or viewpoints.
    4. Weigh the pros and cons of each solution.
    5. Propose a final recommendation based on the analysis.
    `,
	coding: `
    You are an experienced programmer. To solve programming problems, follow this thought process:
    1. Clarify the coding task and identify the requirements.
    2. Break down the task into smaller, manageable parts.
    3. Write the code for each part while explaining the reasoning for your approach.
    4. Ensure the code follows best practices and is optimized for readability and efficiency.
    5. Test the solution, considering edge cases, and propose improvements if necessary.
    `
};

export function getTaskTypePrompt(userMessage: string) {
	return `Analyze the following user message and determine the most appropriate task type from the list below:
    - product_development
    - scientific_research
    - creative_writing
    - coding
    - general

User message: "${userMessage}"

Respond with only the task type, in lowercase, without any additional text or explanation.`;
}

export function getThoughtProcessPrompt(iteration = 1, taskType: keyof typeof taskSpecificPrompts = 'general') {
	taskType = taskSpecificPrompts[taskType] ? taskType : 'general';

	return `This is iteration ${iteration} of the thought process.
${iteration > 1 ? 'Refine and expand upon the previous thoughts.' : ''}
You will follow the structured process laid out below to ensure a logical flow:
${taskSpecificPrompts[taskType]}
Explore hypothetical "what-if" scenarios and potential counterarguments.
Incorporate quantitative analysis where appropriate.
Do not return a final answer, just return the step-by-step thought process.`;
}

function getFinalAnswerPrompt(thoughtProcess: string, evaluationCriteria: string[]) {
	return `You are an AI assistant providing a final answer based on the following thought process:

${thoughtProcess}

Evaluate the solution based on these criteria: ${evaluationCriteria.join(', ')}.
Provide citations for any factual claims or data points.
Consider potential limitations or areas for further research.
Provide a concise and clear final answer to the user's request.`;
}

const evaluationPrompt = `
Evaluate the following thought process on a scale from 0 to 1, where 0 is completely flawed and 1 is perfect:

{thoughtProcess}

Consider the following criteria:
1. Logical coherence
2. Depth of analysis
3. Consideration of alternative viewpoints
4. Use of relevant information
5. Clarity of expression

Provide a single float value between 0 and 1 as the score, without any additional explanation.
`;
// End of Selection

export function generateMindMap(thoughtProcess: string): string {
	const lines = thoughtProcess.split('\n');
	const mindMap: string[] = [];
	let currentLevel = 0;

	for (const line of lines) {
		if (line.trim()) {
			const depth = line.length - line.trimStart().length;
			const node = line.trim();
			if (depth === 0) {
				currentLevel = 0;
				mindMap.push(`${'  '.repeat(currentLevel)}• ${node}`);
			} else {
				currentLevel = Math.floor(depth / 2);
				mindMap.push(`${'  '.repeat(currentLevel)}└─ ${node}`);
			}
		}
	}

	return mindMap.join('\n');
}

export function calculateConfidenceScore(
	thoughtProcess: string,
	iteration: number,
	maxIterations: number,
	correctAnswers: number,
	totalAnswers: number,
	selfEvaluationScore: number
): number {
	const confidenceKeywords = ['certain', 'confident', 'sure', 'likely', 'probable', 'definitely', 'undoubtedly'];
	const uncertaintyKeywords = ['uncertain', 'unsure', 'maybe', 'perhaps', 'possible', 'might', 'could'];

	// Count confidence and uncertainty keyword occurrences
	const confidenceScore = confidenceKeywords.reduce((count, word) => count + (thoughtProcess.toLowerCase().split(word).length - 1), 0);
	const uncertaintyScore = uncertaintyKeywords.reduce((count, word) => count + (thoughtProcess.toLowerCase().split(word).length - 1), 0);

	// Total words in thought process (avoid division by zero)
	const totalWords = thoughtProcess.split(' ').length;
	if (totalWords === 0) {
		return 0;
	}

	// Calculate confidence ratio
	const confidenceRatio = (confidenceScore - uncertaintyScore) / totalWords;
	const baseConfidence = Math.max(0, Math.min(1, (confidenceRatio + 0.1) / 0.2)); // Ensuring it's between 0 and 1

	// Introduce a scaling factor for iteration progress
	const iterationFactor = 1 - iteration / maxIterations;

	// Safeguard for zero total answers
	let initialConfidence: number;
	if (totalAnswers > 0) {
		initialConfidence = baseConfidence * (1 + iterationFactor) * (correctAnswers / totalAnswers);
	} else {
		initialConfidence = baseConfidence * (1 + iterationFactor);
	}

	// Adjust confidence based on self-evaluation score (Ensure it is non-zero)
	const adjustedConfidence = initialConfidence * (selfEvaluationScore > 0 ? selfEvaluationScore : 1);

	return Math.max(0, Math.min(1, adjustedConfidence));
}

export async function selfEvaluate(thoughtProcess: string): Promise<number> {
	/**
	 * Evaluates the thought process by sending it to an LLM API and getting a score between 0 and 1.
	 *
	 * @param thoughtProcess - A string representing the thought process to be evaluated.
	 * @return A score between 0 and 1, indicating the quality of the thought process.
	 */

	// Construct the evaluation prompt
	const prompt = evaluationPrompt.replace('{thoughtProcess}', thoughtProcess);

	// Send the request to OpenAI or other LLM via the existing API call infrastructure
	const response = await callOpenAISync([{ role: 'user', content: prompt }]); // Assuming sendRequest handles API call, response parsing, and errors
	if (response instanceof Stream) {
		throw new Error('Streaming responses are not supported in selfEvaluate');
	}

	let text = response.choices[0].message.content;

	let evaluationScore: number;
	try {
		evaluationScore = parseFloat(text || '0.0');
	} catch (ValueError) {
		evaluationScore = 0.0; // Fallback if score is not a valid float
	}
	return Math.max(0, Math.min(1, evaluationScore)); // Keep it between 0 and 1
}

export function determineTaskTypeAndCriteria(userMessage: string): [string, string[]] {
	/**
	 * Determines the task type based on the user's input and provides criteria to evaluate the task.
	 */
	userMessage = userMessage.toLowerCase();

	const taskKeywords: Record<string, string[]> = {
		product_development: ['product', 'business', 'market', 'customer', 'innovation'],
		scientific_research: ['research', 'experiment', 'hypothesis', 'data', 'analysis'],
		creative_writing: ['story', 'character', 'plot', 'writing', 'narrative'],
		coding: ['code', 'programming', 'function', 'algorithm', 'debug']
	};

	const counts: Record<string, number> = Object.fromEntries(
		Object.entries(taskKeywords).map(([task, keywords]) => [
			task,
			keywords.reduce((sum, keyword) => sum + (userMessage.split(keyword).length - 1), 0)
		])
	);

	const taskType = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));

	const criteria: Record<string, string[]> = {
		product_development: ['market viability', 'innovation', 'user needs', 'feasibility'],
		scientific_research: ['methodology', 'data analysis', 'hypothesis testing', 'literature review'],
		creative_writing: ['character development', 'plot coherence', 'narrative style', 'originality'],
		coding: ['functionality', 'efficiency', 'readability', 'best practices'],
		general: ['clarity', 'relevance', 'accuracy', 'completeness']
	};

	return [taskType, criteria[taskType]];
}
