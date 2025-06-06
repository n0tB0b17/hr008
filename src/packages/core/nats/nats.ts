import { Codec, connect, JSONCodec, NatsConnection, StringCodec, Subscription } from "nats";
import { INatsService } from "./nats.interface";


export class NatsService implements INatsService {
    private nc: NatsConnection | null = null;
    private sc: Codec<string>;
    private jc: Codec<any>;


    constructor(
        private readonly servers: string | string[] = (process.env.NATS_SERVER || 'nats://localhost:4222').split(',')
    ) {
        this.sc = StringCodec();
        this.jc = JSONCodec();

        this.connect();
    }


    private async connect(): Promise<void> {
        try {
            this.nc = await connect({
                servers: this.servers,
                reconnect: true,
                maxReconnectAttempts: 3,
                reconnectTimeWait: 5000
            });

            console.log(`Connected to NATS server: ${this.nc.getServer()}`);

            (async () => {
                for await (const status of this.nc!.status()) {
                    console.log(`NATS server status: ${status.type}`);
                }
            })().then();
        } catch (e: any) {

        }
    }


    async publish(subject: string, data: string): Promise<void> {
        if (!this.isConnected()) {
            console.log(`Not connected, unable to publish`)
            return
        }

        try {
            this.nc?.publish(subject, this.jc.encode(data));
        } catch (e: any) {
            console.log(`Internal error while publishing data to nats: ${e.message}`);
        }
    }

    async subscribe(subject: string, callback: (data: any, message: any) => void): Promise<void> {
        if (!this.isConnected()) {
            console.log(`Not connected, unable to subscribe`);
            return
        }


        const subs: Subscription | undefined = this.nc!.subscribe(subject);

        (async () => {
            for await (const sub of subs) {
                try {
                    callback(this.jc.decode(sub.data), sub);
                } catch (e: any) {
                    console.log(`Internal error while subscribing to nats subject: ${e.message}`)
                }
            }

            console.log(`Subscription closed for: ${subject}`)
        })();
    }



    isConnected(): boolean {
        return this.nc !== null && !this.nc.isClosed();
    }

    async close(): Promise<void> {
        if (this.nc) {
            await this.nc.drain();
            await this.nc.close();
            console.log(`Closing nats connection at: ${this.nc.getServer()}`);
            this.nc = null;
        }
    }
}

export const natsService = new NatsService();