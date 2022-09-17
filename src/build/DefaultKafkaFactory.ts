/** @module build */
import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { KafkaMessageQueue } from '../queues/KafkaMessageQueue';
import { KafkaConnection } from '../connect/KafkaConnection';
import { KafkaMessageQueueFactory } from './KafkaMessageQueueFactory';
import { KafkaConnectionListener } from '../connect/KafkaConnectionListener';

/**
 * Creates [[KafkaMessageQueue]] components by their descriptors.
 * 
 * @see [[KafkaMessageQueue]]
 */
export class DefaultKafkaFactory extends Factory {
    private static readonly KafkaQueueDescriptor: Descriptor = new Descriptor("pip-services", "message-queue", "kafka", "*", "1.0");
	private static readonly KafkaConnectionListenerDescriptor: Descriptor = new Descriptor("pip-services", "connection-listener", "kafka", "*", "1.0");
	private static readonly KafkaConnectionDescriptor: Descriptor = new Descriptor("pip-services", "connection", "kafka", "*", "1.0");
	private static readonly KafkaQueueFactoryDescriptor: Descriptor = new Descriptor("pip-services", "queue-factory", "kafka", "*", "1.0");

	/**
	 * Create a new instance of the factory.
	 */
	public constructor() {
        super();
        this.register(DefaultKafkaFactory.KafkaQueueDescriptor, (locator: Descriptor) => {
            let name = (typeof locator.getName === "function") ? locator.getName() : null; 
            return new KafkaMessageQueue(name);
        });
		this.registerAsType(DefaultKafkaFactory.KafkaConnectionDescriptor, KafkaConnection);
		this.registerAsType(DefaultKafkaFactory.KafkaConnectionListenerDescriptor, KafkaConnectionListener);
		this.registerAsType(DefaultKafkaFactory.KafkaQueueFactoryDescriptor, KafkaMessageQueueFactory);
	}
}