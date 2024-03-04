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

export {ChatMessage,ChatMessageArray};