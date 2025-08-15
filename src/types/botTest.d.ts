export interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
}

// 메타 결과 문서 타입
export interface MetaDocument {
    title?: string;
    [key: string]: unknown;
}

// API 관련 타입들
export interface ChatRequest {
    message: string;
}

export interface ChatResponse {
    timestamp: string;
    success: boolean;
    message: string;
    code: number;
    result: {
        request_content: string;
        response_content: string;
        meta_result: MetaDocument[];
    };
}

export interface BotTestError {
    message: string;
    status?: number;
}
