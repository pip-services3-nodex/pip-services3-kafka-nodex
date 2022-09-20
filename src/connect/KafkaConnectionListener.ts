/** @module connect */

import { ConfigParams, Descriptor, FixedRateTimer, IConfigurable, IOpenable, IReferenceable, IReferences } from "pip-services3-commons-nodex";
import { CompositeLogger } from "pip-services3-components-nodex";
import { IKafkaMessageListener } from "./IKafkaMessageListener";
import { KafkaConnection } from "./KafkaConnection";



/**
 * Kafka connection listener that helps detect if connection to kafka is lost in during of container work
 * 
 * The component starts in backgroud and check kafka connection with interval (default: check_interval=true) 
 * and try reopen connection if configured (default: reconnect=true)
 * 
 * ### Configuration parameters ###
 * - correlation_id:        (optional) transaction id to trace execution through call chain (default: KafkaConnectionListener).
 * - options:
 *    - reconnect (default: true)       (optional) auto reconnect to the queue if lost connection
 *    - autosubscribe (default: true)   (optional) autosubscribe on the topic when reconnect 
 *    - check_interval (default: 1m)    (optional) interval for checking connection alive
 * 
 * ### References ###
 * 
 * - <code>\*:logger:\*:\*:1.0</code>            (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:connection:kafka:\*:1.0</code>     Shared connection to Kafka service
 * - <code>\*:message-queue:kafka:\*:1.0</code>  Kafka message queue
 * 
 */
export class KafkaConnectionListener implements IOpenable, IConfigurable, IReferenceable {
    private _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        "correlation_id", "KafkaConnectionListener",
        "options.log_level", 1,
        "options.reconnect", true,
        "options.autosubscribe", true,
        "options.check_interval", 60000,
    );

    private _topic: string;
    private _groupId: string;
    private _autoCommit: boolean;

    private timer: FixedRateTimer;
    private connection: KafkaConnection;
    private receiver: IKafkaMessageListener;

    /** 
     * The logger.
     */
    protected _logger: CompositeLogger = new CompositeLogger();
    
    // Flag for reconection to kafka
    private _reconnect: boolean;

    // Flag for autosubscribe of the topic queu
    private _autosubscribe: boolean;

    // Delay of check and reconnect try
    private _checkInerval: number;

    private _correlationId: string;

    /**
     * Configures component by passing configuration parameters.
     * 
     * @param config    configuration parameters to be set.
     */
    public configure(config: ConfigParams): void {
        config = config.setDefaults(this._defaultConfig);

        this._correlationId = config.getAsString("correlation_id");
        this._reconnect = config.getAsBoolean("options.reconnect");
        this._autosubscribe = config.getAsBoolean("options.autosubscribe");
        this._checkInerval = config.getAsInteger("options.check_interval");

        // config from queue params
        this._autoCommit = config.getAsBooleanWithDefault("autocommit", this._autoCommit);
        this._groupId = config.getAsStringWithDefault("group_id", this._groupId);
        this._topic = config.getAsStringWithDefault("topic", this._topic);
    }

    /**
     * Sets references to dependent components.
     * 
     * @param references 	references to locate the component dependencies. 
     */
    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this.connection = references.getOneRequired<KafkaConnection>(new Descriptor("pip-services", "connection", "kafka", "*", "*"));
        this.receiver = references.getOneRequired<IKafkaMessageListener>(new Descriptor("pip-services", "message-queue", "kafka", "*", "*"));
    }
    
    /**
     * Checks if connection listener is open
     * @returns an error is connection is closed or <code>null<code> otherwise.
     */
    public isOpen(): boolean {
        return this.timer != null;
    }
    
    /**
     * Opens the component.
     * 
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    public async open(correlationId: string): Promise<void> {
        if (this.isOpen()) {
            return;
        }
        this.timer = new FixedRateTimer(this.checkConnection(this), this._checkInerval, this._checkInerval);
        this.timer.start();
    }

    /**
     * Closes component and frees used resources.
     * 
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    public async close(correlationId: string): Promise<void> {
        if (this.isOpen()) {
            this.timer.stop();
            this.timer = null;
        }
    }

    private async reConnect(): Promise<void> {
        this._logger.trace(this._correlationId, "Kafka connection is lost");

        // Recreate connection
        if (this._reconnect) {
            this._logger.trace(this._correlationId, "Try Kafka reopen connection");

            await this.connection.close(this._correlationId);
            await this.connection.open(this._correlationId);
        }
    }

    private async reSubscribe() :Promise<void> {
        if (this._autosubscribe) {
            // Resubscribe on the topic
            let options = {
                fromBeginning: false,
                autoCommit: this._autoCommit
            };

            await this.connection.subscribe(this._topic, this._groupId, options, this.receiver);

            this._logger.trace(this._correlationId, "Resubscribed on the topic " + this._topic);
        }
    }

    private checkConnection(context: any): () => Promise<void> {
        let isReady: boolean = true; // lock if contex will be switch in background
        return async () => {
            try {
                // try to get topics list
                if (context.connection.isOpen())
                    await context.connection.readQueueNames();
                else 
                    throw Error("Lost connection");
            } catch (ex) {
                if (isReady) {
                    isReady = false;

                    try {
                        await context.reConnect();
                        await context.reSubscribe()

                    } catch {
                        // do nothing...
                    }

                    isReady = true
                }
            }
        }
    }
}