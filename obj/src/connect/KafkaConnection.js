"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConnection = void 0;
/** @module connect */
/** @hidden */
const kafka = require('kafkajs');
/** @hidden */
const os = require('os');
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const KafkaConnectionResolver_1 = require("./KafkaConnectionResolver");
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
class KafkaConnection {
    /**
     * Creates a new instance of the connection component.
     */
    constructor() {
        this._defaultConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples(
        // connections.*
        // credential.*
        "client_id", null, "options.log_level", 1, "options.connect_timeout", 1000, "options.retry_timeout", 30000, "options.max_retries", 5, "options.request_timeout", 30000);
        /**
         * The logger.
         */
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
        /**
         * The connection resolver.
         */
        this._connectionResolver = new KafkaConnectionResolver_1.KafkaConnectionResolver();
        /**
         * The configuration options.
         */
        this._options = new pip_services3_commons_nodex_1.ConfigParams();
        /**
         * Topic subscriptions
         */
        this._subscriptions = [];
        this._clientId = os.hostname();
        this._logLevel = 1;
        this._acks = -1;
        this._connectTimeout = 1000;
        this._maxRetries = 5;
        this._retryTimeout = 30000;
        this._requestTimeout = 30000;
        this._numPartitions = 1;
        this._replicationFactor = 1;
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        config = config.setDefaults(this._defaultConfig);
        this._connectionResolver.configure(config);
        this._options = this._options.override(config.getSection("options"));
        this._clientId = config.getAsStringWithDefault("client_id", this._clientId);
        this._logLevel = config.getAsIntegerWithDefault("options.log_level", this._logLevel);
        this._connectTimeout = config.getAsIntegerWithDefault("options.connect_timeout", this._connectTimeout);
        this._maxRetries = config.getAsIntegerWithDefault("options.max_retries", this._maxRetries);
        this._retryTimeout = config.getAsIntegerWithDefault("options.retry_timeout", this._retryTimeout);
        this._requestTimeout = config.getAsIntegerWithDefault("options.request_timeout", this._requestTimeout);
        this._acks = config.getAsIntegerWithDefault("options.acks", this._acks);
        this._numPartitions = config.getAsIntegerWithDefault('options.num_partitions', this._numPartitions);
        this._replicationFactor = config.getAsIntegerWithDefault('options.replication_factor', this._replicationFactor);
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._logger.setReferences(references);
        this._connectionResolver.setReferences(references);
    }
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen() {
        return this._connection != null;
    }
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._connection != null) {
                return;
            }
            let config = yield this._connectionResolver.resolve(correlationId);
            try {
                let options = {
                    clientId: this._clientId,
                    retry: {
                        maxRetryType: this._requestTimeout,
                        retries: this._maxRetries
                    },
                    requestTimeout: this._requestTimeout,
                    connectionTimeout: this._connectTimeout,
                    logLevel: this._logLevel
                };
                let brokers = config.getAsString("brokers");
                options.brokers = brokers.split(",");
                options.ssl = config.getAsBoolean("ssl");
                let username = config.getAsString("username");
                let password = config.getAsString("password");
                let mechanism = config.getAsStringWithDefault("mechanism", "plain");
                if (username != null) {
                    options.sasl = {
                        mechanism: mechanism,
                        username: username,
                        password: password,
                    };
                }
                this._clientConfig = options;
                let connection = new kafka.Kafka(options);
                let producer = connection.producer();
                yield producer.connect();
                this._connection = connection;
                this._producer = producer;
                this._logger.debug(correlationId, "Connected to Kafka broker at " + brokers);
            }
            catch (ex) {
                this._logger.error(correlationId, ex, "Failed to connect to Kafka server");
                throw new pip_services3_commons_nodex_2.ConnectionException(correlationId, "CONNECT_FAILED", "Connection to Kafka service failed").withCause(ex);
            }
        });
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._connection == null) {
                return;
            }
            // Disconnect producer
            this._producer.disconnect();
            this._producer = null;
            // Disconnect admin client
            if (this._adminClient != null) {
                this._adminClient.disconnect();
                this._adminClient = null;
            }
            // Disconnect consumers
            for (let subscription of this._subscriptions) {
                if (subscription.handler) {
                    subscription.handler.disconnect();
                }
            }
            this._subscriptions = [];
            this._connection = null;
            this._logger.debug(correlationId, "Disconnected from Kafka server");
        });
    }
    getConnection() {
        return this._connection;
    }
    getProducer() {
        return this._producer;
    }
    /**
     * Checks if connection is open
     * @returns an error is connection is closed or <code>null<code> otherwise.
     */
    checkOpen() {
        if (this.isOpen())
            return;
        throw new pip_services3_commons_nodex_3.InvalidStateException(null, "NOT_OPEN", "Connection was not opened");
    }
    /**
     * Connect admin client on demand.
     */
    connectToAdmin() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkOpen();
            if (this._adminClient != null) {
                return;
            }
            let adminClient = this._connection.admin();
            yield adminClient.connect();
            this._adminClient = adminClient;
        });
    }
    /**
     * Reads a list of registered queue names.
     * If connection doesn't support this function returnes an empty list.
     * @returns queue names.
     */
    readQueueNames() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectToAdmin();
            return yield this._adminClient.listTopics();
        });
    }
    /**
     * Creates a message queue.
     * If connection doesn't support this function it exists without error.
     * @param name the name of the queue to be created.
     */
    createQueue(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkOpen();
            this.connectToAdmin();
            yield this._adminClient.createTopics({ topics: [{
                        topic: name,
                        numPartitions: this._numPartitions,
                        replicationFactor: this._replicationFactor
                    }] });
        });
    }
    /**
     * Deletes a message queue.
     * If connection doesn't support this function it exists without error.
     * @param name the name of the queue to be deleted.
     */
    deleteQueue(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkOpen();
            this.connectToAdmin();
            yield this._adminClient.deleteTopics({
                topics: [name]
            });
        });
    }
    /**
     * Publish a message to a specified topic
     * @param topic a topic where the message will be placed
     * @param messages a list of messages to be published
     * @param options publishing options
     */
    publish(topic, messages) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for open connection
            this.checkOpen();
            yield this._producer.send({
                topic: topic,
                messages: messages,
                acks: this._acks,
                timeout: this._connectTimeout
            });
        });
    }
    /**
     * Subscribe to a topic
     * @param subject a subject(topic) name
     * @param groupId (optional) a consumer group id
     * @param options subscription options
     * @param listener a message listener
     */
    subscribe(topic, groupId, options, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for open connection
            this.checkOpen();
            options = options || {};
            // Subscribe to topic
            let consumer = this._connection.consumer({
                groupId: groupId || "default",
                sessionTimeout: options.sessionTimeout,
                heartbeatInterval: options.heartbeatInterval,
                rebalanceTimeout: options.rebalanceTimeout,
                allowAutoTopicCreation: true
            });
            try {
                yield consumer.connect();
                yield consumer.subscribe({
                    topic: topic,
                    fromBeginning: options.fromBeginning,
                });
                yield consumer.run({
                    partitionsConsumedConcurrently: options.partitionsConsumedConcurrently,
                    autoCommit: options.autoCommit,
                    autoCommitInterval: options.autoCommitInterval,
                    autoCommitThreshold: options.autoCommitThreshold,
                    eachMessage: ({ topic, partition, message }) => __awaiter(this, void 0, void 0, function* () {
                        listener.onMessage(topic, partition, message);
                    })
                });
                // Add the subscription
                let subscription = {
                    topic: topic,
                    groupId: groupId,
                    options: options,
                    handler: consumer,
                    listener: listener
                };
                this._subscriptions.push(subscription);
                // listen consumer crashes
                const { CRASH } = consumer.events;
                const { REQUEST_TIMEOUT } = consumer.events;
                consumer.on(CRASH, (event) => __awaiter(this, void 0, void 0, function* () {
                    yield restartConsumer(event);
                }));
                consumer.on(REQUEST_TIMEOUT, (event) => __awaiter(this, void 0, void 0, function* () {
                    yield restartConsumer(event);
                }));
                let isReady = true;
                const restartConsumer = (event) => __awaiter(this, void 0, void 0, function* () {
                    let err = event != null && event.payload != null ? event.payload.error : new Error("Consummer disconnected");
                    this._logger.error(null, err, "Consummer crashed, try restart");
                    while (true) {
                        if (!isReady)
                            continue;
                        isReady = false;
                        try {
                            this._logger.trace(null, "Try restart consummer");
                            // restart consumer
                            yield consumer.connect();
                            yield consumer.subscribe({
                                topic: topic,
                                fromBeginning: options.fromBeginning,
                            });
                            yield consumer.run({
                                partitionsConsumedConcurrently: options.partitionsConsumedConcurrently,
                                autoCommit: options.autoCommit,
                                autoCommitInterval: options.autoCommitInterval,
                                autoCommitThreshold: options.autoCommitThreshold,
                                eachMessage: ({ topic, partition, message }) => __awaiter(this, void 0, void 0, function* () {
                                    listener.onMessage(topic, partition, message);
                                })
                            });
                            this._logger.trace(null, "Consummer restarted");
                            break;
                        }
                        catch (_a) {
                            // do nothing...
                        }
                        finally {
                            isReady = true;
                        }
                    }
                });
            }
            catch (ex) {
                this._logger.error(null, ex, "Failed to connect Kafka consumer.");
                throw ex;
            }
        });
    }
    /**
     * Unsubscribe from a previously subscribed topic
     * @param topic a topic name
     * @param groupId (optional) a consumer group id
     * @param listener a message listener
     */
    unsubscribe(topic, groupId, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            // Find the subscription index
            let index = this._subscriptions.findIndex((s) => s.topic == topic && s.groupId == groupId && s.listener == listener);
            if (index < 0) {
                return;
            }
            // Remove the subscription
            let subscription = this._subscriptions.splice(index, 1)[0];
            // Unsubscribe from the topic
            if (this.isOpen() && subscription.handler != null) {
                yield subscription.handler.disconnect();
            }
        });
    }
    /**
     * Commit a message offset.
     * @param topic a topic name
     * @param groupId (optional) a consumer group id
     * @param partition a partition number
     * @param offset a message offset
     * @param listener a message listener
     */
    commit(topic, groupId, partition, offset, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for open connection
            this.checkOpen();
            // Find the subscription index
            let subscription = this._subscriptions.find((s) => s.topic == topic && s.groupId == groupId && s.listener == listener);
            if (subscription == null || subscription.options.autoCommit) {
                return;
            }
            // Commit the offset
            yield subscription.handler.commitOffsets([
                { topic: topic, partition: partition, offset: offset }
            ]);
        });
    }
    /**
     * Seek a message offset.
     * @param topic a topic name
     * @param groupId (optional) a consumer group id
     * @param partition a partition number
     * @param offset a message offset
     * @param listener a message listener
     */
    seek(topic, groupId, partition, offset, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for open connection
            this.checkOpen();
            // Find the subscription index
            let subscription = this._subscriptions.find((s) => s.topic == topic && s.groupId == groupId && s.listener == listener);
            if (subscription == null || subscription.options.autoCommit) {
                return;
            }
            // Seek the offset
            yield subscription.handler.seek([
                { topic: topic, partition: partition, offset: offset }
            ]);
        });
    }
}
exports.KafkaConnection = KafkaConnection;
//# sourceMappingURL=KafkaConnection.js.map