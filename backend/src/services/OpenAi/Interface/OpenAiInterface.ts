const TYPE_IN_JSON:string = 'inJson';

interface ChatMessageArray {
    messages:       ChatMessage[];
    model:          string;
    temperature:    number;
    top_p:          number;
    response_format?: {
        type: string;
    };
}

interface ChatMessage {
    role:       string;
    content:    string;
}

interface PromptAICallInterface {
    key:        string;
    saveTo:     string;
    saveKey:    string;
    msgUser:    {
        type:   string,
        user:   [{
            message: string
        }],
        field?: string
    };
    complete:   number;
}

type PromptAiCallsInterface = PromptAICallInterface[];

export type {PromptAiCallsInterface};
export {PromptAICallInterface,ChatMessage,ChatMessageArray, TYPE_IN_JSON};