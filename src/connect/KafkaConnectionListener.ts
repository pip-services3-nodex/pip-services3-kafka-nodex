/** @module connect */

import { ConfigParams, Descriptor, FixedRateTimer, IConfigurable, IOpenable, IReferenceable, IReferences } from "pip-services3-commons-nodex";
import { CompositeLogger } from "pip-services3-components-nodex";
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
 *    - reconnect (default: true)
 *    - check_interval (default: 1m)
 * ### References ###
 * 
 * - <code>\*:logger:\*:\*:1.0</code>           (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:connection:kafka:\*:1.0</code>       (optional) Shared connection to Kafka service
 * 
 */
export class KafkaConnectionListener implements IOpenable, IConfigurable, IReferenceable {
    private _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        "correlation_id", "KafkaConnectionListener",
        "options.log_level", 1,
        "options.reconnect", true,
        "options.check_interval", 60000,
    );

    private timer: FixedRateTimer;
    private connection: KafkaConnection;

    /** 
     * The logger.
     */
    protected _logger: CompositeLogger = new CompositeLogger();
    
    // Flag for reconection to kafka
    private _reconnect: boolean;

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
        this._checkInerval = config.getAsInteger("options.check_interval");
    }

    /**
     * Sets references to dependent components.
     * 
     * @param references 	references to locate the component dependencies. 
     */
    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this.connection = references.getOneRequired<KafkaConnection>(new Descriptor("pip-services", "connection", "kafka", "*", "*"));
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

    private checkConnection(context: any): () => Promise<void> {
        return async () => {
            try {
                // try to get topics list
                await context.connection.readQueueNames();
            } catch (ex) {
                this._logger.trace(this._correlationId, "Kafka connection is lost");
                
                // Recreate connection
                if (this._reconnect) {
                    this._logger.trace(this._correlationId, "Try Kafka reopen connection");

                    await context.connection.close(this._correlationId);
                    await context.connection.open(this._correlationId);
                }
                    
            }
        }
    }
    
}