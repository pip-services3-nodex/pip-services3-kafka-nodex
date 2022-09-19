/** @module connect */
import { ConfigParams, IConfigurable, IOpenable, IReferenceable, IReferences } from "pip-services3-commons-nodex";
import { CompositeLogger } from "pip-services3-components-nodex";
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
 *    - resubscribe (default: true)
 *    - check_interval (default: 1m)
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>           (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:connection:kafka:\*:1.0</code>       (optional) Shared connection to Kafka service
 *
 */
export declare class KafkaConnectionListener implements IOpenable, IConfigurable, IReferenceable {
    private _defaultConfig;
    private _topic;
    private _groupId;
    private _autoCommit;
    private timer;
    private connection;
    private queue;
    /**
     * The logger.
     */
    protected _logger: CompositeLogger;
    private _reconnect;
    private _resubscribe;
    private _checkInerval;
    private _correlationId;
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config: ConfigParams): void;
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references: IReferences): void;
    /**
     * Checks if connection listener is open
     * @returns an error is connection is closed or <code>null<code> otherwise.
     */
    isOpen(): boolean;
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId: string): Promise<void>;
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId: string): Promise<void>;
    private reConnect;
    private reSubscribe;
    private checkConnection;
}
