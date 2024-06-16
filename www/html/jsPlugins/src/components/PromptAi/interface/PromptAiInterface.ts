import { PromptAiArrayWithIdType } from "../../../dbService/models/PromptAi";

interface PromptAiProps {
	promptsAi: 	PromptAiArrayWithIdType;
	total: 		number,
	page: 		number,
	pageSize: 	number,
}

export type {PromptAiProps};