interface ChatMessageArray {
    messages: ChatMessage[];
    model: string;
    temperature: number;
    top_p: number;
    response_format?: {
        type: string;
    };
}

interface ChatMessage {
    role: string;
    content: string;
}

interface PromptAICallInterface {
    key: string;
    saveTo: string;
    saveKey: string;
    complete: number;
}

type PromptAiCallsInterface  = PromptAICallInterface[];

export type {PromptAiCallsInterface};
export {PromptAICallInterface,ChatMessage,ChatMessageArray};