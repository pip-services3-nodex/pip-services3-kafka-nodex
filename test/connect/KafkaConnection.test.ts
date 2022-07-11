const assert = require('chai').assert;
const process = require('process');

import { ConfigParams } from 'pip-services3-commons-nodex';

import { KafkaConnection } from '../../src/connect/KafkaConnection';

suite('KafkaConnection', ()=> {
    let connection: KafkaConnection;

    let brokerHost = process.env['KAFKA_SERVICE_HOST'] || 'localhost';
    let brokerPort = process.env['KAFKA_SERVICE_PORT'] || 9092;
    if (brokerHost == '' && brokerPort == '') {
        return;
    }
    let brokerTopic = process.env['KAFKA_TOPIC'] || 'test';
    let brokerUser = process.env['KAFKA_USER']; // || 'kafka';
    let brokerPass = process.env['KAFKA_PASS']; // || 'pass123';

    setup(() => {
        let config = ConfigParams.fromTuples(
            'topic', brokerTopic,
            'connection.protocol', 'tcp',
            'connection.host', brokerHost,
            'connection.port', brokerPort,
            'credential.username', brokerUser,
            'credential.password', brokerPass,
            'credential.mechanism', 'plain',
            'options.num_partitions', 2,
            'options.readable_partitions', '1',
            'options.write_partition', '1'
        );        

        connection = new KafkaConnection();
        connection.configure(config);
    });

    test('Open/Close', async () => {
        await connection.open(null);
        assert.isTrue(connection.isOpen());
        assert.isNotNull(connection.getConnection());

        await connection.close(null);
        assert.isFalse(connection.isOpen());
        assert.isNull(connection.getConnection());
    });

    test('ListTopics', async () => {
        await connection.open(null);
        assert.isTrue(connection.isOpen());
        assert.isNotNull(connection.getConnection());

        let topics = await connection.readQueueNames();
        assert.isArray(topics);

        await connection.close(null);
        assert.isFalse(connection.isOpen());
        assert.isNull(connection.getConnection());
    });    
});