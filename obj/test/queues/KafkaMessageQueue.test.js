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
let process = require('process');
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const MessageQueueFixture_1 = require("./MessageQueueFixture");
const KafkaMessageQueue_1 = require("../../src/queues/KafkaMessageQueue");
suite('KafkaMessageQueue', () => {
    let queue;
    let fixture;
    let brokerHost = process.env['KAFKA_SERVICE_HOST'] || 'localhost';
    let brokerPort = process.env['KAFKA_SERVICE_PORT'] || 9092;
    if (brokerHost == '' && brokerPort == '') {
        return;
    }
    let brokerTopic = process.env['KAFKA_TOPIC'] || 'test';
    let brokerUser = process.env['KAFKA_USER']; // || 'kafka';
    let brokerPass = process.env['KAFKA_PASS']; // || 'pass123';
    let queueConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples('queue', brokerTopic, 'connection.protocol', 'tcp', 'connection.host', brokerHost, 'connection.port', brokerPort, 'credential.username', brokerUser, 'credential.password', brokerPass, 'credential.mechanism', 'plain', 'options.autosubscribe', true);
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        queue = new KafkaMessageQueue_1.KafkaMessageQueue(brokerTopic);
        queue.configure(queueConfig);
        fixture = new MessageQueueFixture_1.MessageQueueFixture(queue);
        yield queue.open(null);
        // await queue.clear(null);
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield queue.close(null);
    }));
    test('Send and Receive Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testSendReceiveMessage();
    }));
    test('Receive and Send Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testReceiveSendMessage();
    }));
    test('Send Peek Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testSendPeekMessage();
    }));
    test('Peek No Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testPeekNoMessage();
    }));
    test('On Message', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testOnMessage();
    }));
});
//# sourceMappingURL=KafkaMessageQueue.test.js.map