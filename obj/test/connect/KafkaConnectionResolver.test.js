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
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const KafkaConnectionResolver_1 = require("../../src/connect/KafkaConnectionResolver");
suite('KafkaConnectionResolver', () => {
    test('Single Connection', () => __awaiter(void 0, void 0, void 0, function* () {
        let resolver = new KafkaConnectionResolver_1.KafkaConnectionResolver();
        resolver.configure(pip_services3_commons_nodex_1.ConfigParams.fromTuples("connection.protocol", "tcp", "connection.host", "localhost", "connection.port", 9092));
        let connection = yield resolver.resolve(null);
        assert.equal("localhost:9092", connection.getAsString("brokers"));
        assert.isNull(connection.getAsString("username"));
        assert.isNull(connection.getAsString("password"));
        assert.isNull(connection.getAsString("token"));
    }));
    test('Cluster Connection', () => __awaiter(void 0, void 0, void 0, function* () {
        let resolver = new KafkaConnectionResolver_1.KafkaConnectionResolver();
        resolver.configure(pip_services3_commons_nodex_1.ConfigParams.fromTuples("connections.0.protocol", "tcp", "connections.0.host", "server1", "connections.0.port", 9092, "connections.1.protocol", "tcp", "connections.1.host", "server2", "connections.1.port", 9092, "connections.2.protocol", "tcp", "connections.2.host", "server3", "connections.2.port", 9092));
        let connection = yield resolver.resolve(null);
        assert.isNotNull(connection.getAsString("brokers"));
        assert.isNull(connection.getAsString("username"));
        assert.isNull(connection.getAsString("password"));
        assert.isNull(connection.getAsString("token"));
    }));
    test('Cluster Connection with Auth', () => __awaiter(void 0, void 0, void 0, function* () {
        let resolver = new KafkaConnectionResolver_1.KafkaConnectionResolver();
        resolver.configure(pip_services3_commons_nodex_1.ConfigParams.fromTuples("connections.0.protocol", "tcp", "connections.0.host", "server1", "connections.0.port", 9092, "connections.1.protocol", "tcp", "connections.1.host", "server2", "connections.1.port", 9092, "connections.2.protocol", "tcp", "connections.2.host", "server3", "connections.2.port", 9092, "credential.mechanism", "plain", "credential.username", "test", "credential.password", "pass123"));
        let connection = yield resolver.resolve(null);
        assert.isNotNull(connection.getAsString("brokers"));
        assert.equal("test", connection.getAsString("username"));
        assert.equal("pass123", connection.getAsString("password"));
        assert.equal("plain", connection.getAsString("mechanism"));
    }));
    test('Cluster URI', () => __awaiter(void 0, void 0, void 0, function* () {
        let resolver = new KafkaConnectionResolver_1.KafkaConnectionResolver();
        resolver.configure(pip_services3_commons_nodex_1.ConfigParams.fromTuples("connection.uri", "tcp://test:pass123@server1:9092,server2:9092,server3:9092?param=234"));
        let connection = yield resolver.resolve(null);
        assert.isNotNull(connection.getAsString("brokers"));
        assert.equal("test", connection.getAsString("username"));
        assert.equal("pass123", connection.getAsString("password"));
        assert.isNull(connection.getAsString("mechanism"));
    }));
});
//# sourceMappingURL=KafkaConnectionResolver.test.js.map