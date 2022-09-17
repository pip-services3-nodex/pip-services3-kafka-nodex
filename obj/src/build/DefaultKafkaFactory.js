"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultKafkaFactory = void 0;
/** @module build */
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const KafkaMessageQueue_1 = require("../queues/KafkaMessageQueue");
const KafkaConnection_1 = require("../connect/KafkaConnection");
const KafkaMessageQueueFactory_1 = require("./KafkaMessageQueueFactory");
const KafkaConnectionListener_1 = require("../connect/KafkaConnectionListener");
/**
 * Creates [[KafkaMessageQueue]] components by their descriptors.
 *
 * @see [[KafkaMessageQueue]]
 */
class DefaultKafkaFactory extends pip_services3_components_nodex_1.Factory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.register(DefaultKafkaFactory.KafkaQueueDescriptor, (locator) => {
            let name = (typeof locator.getName === "function") ? locator.getName() : null;
            return new KafkaMessageQueue_1.KafkaMessageQueue(name);
        });
        this.registerAsType(DefaultKafkaFactory.KafkaConnectionDescriptor, KafkaConnection_1.KafkaConnection);
        this.registerAsType(DefaultKafkaFactory.KafkaConnectionListenerDescriptor, KafkaConnectionListener_1.KafkaConnectionListener);
        this.registerAsType(DefaultKafkaFactory.KafkaQueueFactoryDescriptor, KafkaMessageQueueFactory_1.KafkaMessageQueueFactory);
    }
}
exports.DefaultKafkaFactory = DefaultKafkaFactory;
DefaultKafkaFactory.KafkaQueueDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "message-queue", "kafka", "*", "1.0");
DefaultKafkaFactory.KafkaConnectionListenerDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "connection-listener", "kafka", "*", "1.0");
DefaultKafkaFactory.KafkaConnectionDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "connection", "kafka", "*", "1.0");
DefaultKafkaFactory.KafkaQueueFactoryDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "queue-factory", "kafka", "*", "1.0");
//# sourceMappingURL=DefaultKafkaFactory.js.map