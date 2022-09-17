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
const assert = require('chai').assert;
const process = require('process');
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const KafkaConnection_1 = require("../../src/connect/KafkaConnection");
suite('KafkaConnection', () => {
    let connection;
    let brokerHost = process.env['KAFKA_SERVICE_HOST'] || 'localhost';
    let brokerPort = process.env['KAFKA_SERVICE_PORT'] || 9092;
    if (brokerHost == '' && brokerPort == '') {
        return;
    }
    let brokerTopic = process.env['KAFKA_TOPIC'] || 'test';
    let brokerUser = process.env['KAFKA_USER']; // || 'kafka';
    let brokerPass = process.env['KAFKA_PASS']; // || 'pass123';
    setup(() => {
        let config = pip_services3_commons_nodex_1.ConfigParams.fromTuples('topic', brokerTopic, 'connection.protocol', 'tcp', 'connection.host', brokerHost, 'connection.port', brokerPort, 'credential.username', brokerUser, 'credential.password', brokerPass, 'credential.mechanism', 'plain', 'options.num_partitions', 2, 'options.read_partitions', '1', 'options.write_partition', '1');
        connection = new KafkaConnection_1.KafkaConnection();
        connection.configure(config);
    });
    test('Open/Close', () => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.open(null);
        assert.isTrue(connection.isOpen());
        assert.isNotNull(connection.getConnection());
        yield connection.close(null);
        assert.isFalse(connection.isOpen());
        assert.isNull(connection.getConnection());
    }));
    test('ListTopics', () => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.open(null);
        assert.isTrue(connection.isOpen());
        assert.isNotNull(connection.getConnection());
        let topics = yield connection.readQueueNames();
        assert.isArray(topics);
        yield connection.close(null);
        assert.isFalse(connection.isOpen());
        assert.isNull(connection.getConnection());
    }));
});
//# sourceMappingURL=KafkaConnection.test.js.map