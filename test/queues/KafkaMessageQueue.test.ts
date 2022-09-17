let process = require('process');

import { ConfigParams } from 'pip-services3-commons-nodex';

import { MessageQueueFixture } from './MessageQueueFixture';
import { KafkaMessageQueue } from '../../src/queues/KafkaMessageQueue';

suite('KafkaMessageQueue', () => {
    let queue: KafkaMessageQueue;
    let fixture: MessageQueueFixture;

    let brokerHost = process.env['KAFKA_SERVICE_HOST'] || 'localhost';
    let brokerPort = process.env['KAFKA_SERVICE_PORT'] || 9092;
    if (brokerHost == '' && brokerPort == '') {
        return;
    }
    let brokerTopic = process.env['KAFKA_TOPIC'] || 'test';
    let brokerUser = process.env['KAFKA_USER']; // || 'kafka';
    let brokerPass = process.env['KAFKA_PASS']; // || 'pass123';

    let queueConfig = ConfigParams.fromTuples(
        'queue', brokerTopic,
        'connection.protocol', 'tcp',
        'connection.host', brokerHost,
        'connection.port', brokerPort,
        'credential.username', brokerUser,
        'credential.password', brokerPass,
        'credential.mechanism', 'plain',
        'options.autosubscribe', true,
        'options.num_partitions', 2,
        'options.read_partitions', '1',
        'options.write_partition', '1',
        "options.listen_connection", true
    );

    setup(async () => {
        queue = new KafkaMessageQueue(brokerTopic);
        queue.configure(queueConfig);

        fixture = new MessageQueueFixture(queue);

        await queue.open(null);
        // await queue.clear(null);
    });

    teardown(async () => {
        await queue.close(null);
    });

    test('Send and Receive Message', async () => {
        await fixture.testSendReceiveMessage();
    });

    test('Receive and Send Message', async () => {
        await fixture.testReceiveSendMessage();
    });

    test('Send Peek Message', async () => {
        await fixture.testSendPeekMessage();
    });

    test('Peek No Message', async () => {
        await fixture.testPeekNoMessage();
    });

    test('On Message', async () => {
        await fixture.testOnMessage();
    });
});