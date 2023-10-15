export interface BaseEvent {
    process(...args: any[]): Promise<void>;
}
