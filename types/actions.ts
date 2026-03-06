export interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    errors?: Record<string, string[]>;
    message?: string;
}
