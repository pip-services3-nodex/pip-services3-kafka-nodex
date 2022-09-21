import { IReferenceable } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IOpenable } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { CompositeLogger } from 'pip-services3-components-nodex';
import { IMessageQueueConnection } from 'pip-services3-messaging-nodex';
import { KafkaConnectionResolver } from './KafkaConnectionResolver';
import { IKafkaMessageListener } from './IKafkaMessageListener';
import { KafkaSubscription } from './KafkaSubscription';
/**
 * Kafka connection using plain driver.
 *
 * By defining a connection and sharing it through multiple message queues
 * you can reduce number of used database connections.
 *
 * ### Configuration parameters ###
 *
 * - client_id:               (optional) name of the client id
 * - connection(s):
 *   - discovery_key:             (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *   - host:                      host name or IP address
 *   - port:                      port number (default: 27017)
 *   - uri:                       resource URI or connection string with all parameters in it
 * - credential(s):
 *   - store_key:                 (optional) a key to retrieve the credentials from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/auth.icredentialstore.html ICredentialStore]]
 *   - username:                  user name
 *   - password:                  user password
 * - options:
 *   - acks                  (optional) control the number of required acks: -1 - all, 0 - none, 1 - only leader (default: -1)
 *   - num_partitions:       (optional) number of partitions of the created topic (default: 1)
 *   - replication_factor:   (optional) kafka replication factor of the topic (default: 1)
 *   - log_level:            (optional) log level 0 - None, 1 - Error, 2 - Warn, 3 - Info, 4 - Debug (default: 1)
 *   - connect_timeout:      (optional) number of milliseconds to connect to broker (default: 1000)
 *   - max_retries:          (optional) maximum retry attempts (default: 5)
 *   - retry_timeout:        (optional) number of milliseconds to wait on each reconnection attempt (default: 30000)
 *   - request_timeout:      (optional) number of milliseconds to wait on flushing messages (default: 30000)
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>           (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:discovery:\*:\*:1.0</code>        (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services
 * - <code>\*:credential-store:\*:\*:1.0</code> (optional) Credential stores to resolve credentials
 *
 */
export declare class KafkaConnection implements IMessageQueueConnection, IReferenceable, IConfigurable, IOpenable {
    private _defaultConfig;
    /**
     * The logger.
     */
    protected _logger: CompositeLogger;
    /**
     * The connection resolver.
     */
    protected _connectionResolver: KafkaConnectionResolver;
    /**
     * The configuration options.
     */
    protected _options: ConfigParams;
    /**
     * The Kafka connection pool object.
     */
    protected _connection: any;
    /**
     * Kafka connection properties
     */
    protected _clientConfig: any;
    /**
     * The Kafka message producer object;
     */
    protected _producer: any;
    /**
     * The Kafka admin client object;
     */
    protected _adminClient: any;
    /**
     * Topic subscriptions
     */
    protected _subscriptions: KafkaSubscription[];
    protected _clientId: string;
    protected _logLevel: number;
    protected _acks: number;
    protected _connectTimeout: number;
    protected _maxRetries: number;
    protected _retryTimeout: number;
    protected _requestTimeout: number;
    protected _numPartitions: number;
    protected _replicationFactor: number;
    /**
     * Creates a new instance of the connection component.
     */
    constructor();
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
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
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
    getConnection(): any;
    getProducer(): any;
    /**
     * Checks if connection is open
     * @returns an error is connection is closed or <code>null<code> otherwise.
     */
    protected checkOpen(): void;
    /**
     * Connect admin client on demand.
     */
    protected connectToAdmin(): Promise<void>;
    /**
     * Reads a list of registered queue names.
     * If connection doesn't support this function returnes an empty list.
     * @returns queue names.
     */
    readQueueNames(): Promise<string[]>;
    /**
     * Creates a message queue.
     * If connection doesn't support this function it exists without error.
     * @param name the name of the queue to be created.
     */
    createQueue(name: string): Promise<void>;
    /**
     * Deletes a message queue.
     * If connection doesn't support this function it exists without error.
     * @param name the name of the queue to be deleted.
     */
    deleteQueue(name: string): Promise<void>;
    /**
     * Publish a message to a specified topic
     * @param topic a topic where the message will be placed
     * @param messages a list of messages to be published
     * @param options publishing options
     */
    publish(topic: string, messages: any[]): Promise<void>;
    /**
     * Subscribe to a topic
     * @param subject a subject(topic) name
     * @param groupId (optional) a consumer group id
     * @param options subscription options
     * @param listener a message listener
     */
    subscribe(topic: string, groupId: string, options: any, listener: IKafkaMessageListener): Promise<void>;
    /**
     * Unsubscribe from a previously subscribed topic
     * @param topic a topic name
     * @param groupId (optional) a consumer group id
     * @param listener a message listener
     */
    unsubscribe(topic: string, groupId: string, listener: IKafkaMessageListener): Promise<void>;
    /**
     * Commit a message offset.
     * @param topic a topic name
     * @param groupId (optional) a consumer group id
     * @param partition a partition number
     * @param offset a message offset
     * @param listener a message listener
     */
    commit(topic: string, groupId: string, partition: number, offset: number, listener: IKafkaMessageListener): Promise<void>;
    /**
     * Seek a message offset.
     * @param topic a topic name
     * @param groupId (optional) a consumer group id
     * @param partition a partition number
     * @param offset a message offset
     * @param listener a message listener
     */
    seek(topic: string, groupId: string, partition: number, offset: number, listener: IKafkaMessageListener): Promise<void>;
}
