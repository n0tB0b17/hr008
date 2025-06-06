export interface INatsService {
    publish(subject: string, data: string): Promise<void>
    subscribe(subject: string, callback: (data: any, message: any) => void): Promise<void>
    isConnected(): boolean
    close(): Promise<void>
}