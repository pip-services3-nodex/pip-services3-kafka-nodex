const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';

import { KafkaConnectionResolver } from '../../src/connect/KafkaConnectionResolver';

suite('KafkaConnectionResolver', ()=> {

    test('Single Connection', async () => {
        let resolver = new KafkaConnectionResolver();
        resolver.configure(ConfigParams.fromTuples(
            "connection.protocol", "tcp",
            "connection.host", "localhost",
            "connection.port", 9092
        ));
    
        let connection = await resolver.resolve(null);
        assert.equal("localhost:9092", connection.getAsString("brokers"));
        assert.isNull(connection.getAsString("username"));
        assert.isNull(connection.getAsString("password"));
        assert.isNull(connection.getAsString("token"));
    });

    test('Cluster Connection', async () => {
        let resolver = new KafkaConnectionResolver();
        resolver.configure(ConfigParams.fromTuples(
            "connections.0.protocol", "tcp",
            "connections.0.host", "server1",
            "connections.0.port", 9092,
            "connections.1.protocol", "tcp",
            "connections.1.host", "server2",
            "connections.1.port", 9092,
            "connections.2.protocol", "tcp",
            "connections.2.host", "server3",
            "connections.2.port", 9092,
        ));
    
        let connection = await resolver.resolve(null);
        assert.isNotNull(connection.getAsString("brokers"));
        assert.isNull(connection.getAsString("username"));
        assert.isNull(connection.getAsString("password"));
        assert.isNull(connection.getAsString("token"));
    });

    test('Cluster Connection with Auth', async () => {
        let resolver = new KafkaConnectionResolver();
        resolver.configure(ConfigParams.fromTuples(
            "connections.0.protocol", "tcp",
            "connections.0.host", "server1",
            "connections.0.port", 9092,
            "connections.1.protocol", "tcp",
            "connections.1.host", "server2",
            "connections.1.port", 9092,
            "connections.2.protocol", "tcp",
            "connections.2.host", "server3",
            "connections.2.port", 9092,
            "credential.mechanism", "plain",
            "credential.username", "test",
            "credential.password", "pass123",
        ));
    
        let connection = await resolver.resolve(null);
        assert.isNotNull(connection.getAsString("brokers"));
        assert.equal("test", connection.getAsString("username"));
        assert.equal("pass123", connection.getAsString("password"));
        assert.equal("plain", connection.getAsString("mechanism"));
    });

    test('Cluster URI', async () => {
        let resolver = new KafkaConnectionResolver();
        resolver.configure(ConfigParams.fromTuples(
            "connection.uri", "tcp://test:pass123@server1:9092,server2:9092,server3:9092?param=234",
        ));
    
        let connection = await resolver.resolve(null);
        assert.isNotNull(connection.getAsString("brokers"));
        assert.equal("test", connection.getAsString("username"));
        assert.equal("pass123", connection.getAsString("password"));
        assert.isNull(connection.getAsString("mechanism"));
    });

});