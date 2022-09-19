"use strict";
/** @module connect */
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
exports.KafkaConnectionListener = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
/**
 * Kafka connection listener that helps detect if connection to kafka is lost in during of container work
 *
 * The component starts in backgroud and check kafka connection with interval (default: check_interval=true)
 * and try reopen connection if configured (default: reconnect=true)
 *
 * ### Configuration parameters ###
 * - correlation_id:        (optional) transaction id to trace execution through call chain (default: KafkaConnectionListener).
 * - options:
 *    - reconnect (default: true)
 *    - check_interval (default: 1m)
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>           (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:connection:kafka:\*:1.0</code>       (optional) Shared connection to Kafka service
 *
 */
class KafkaConnectionListener {
    constructor() {
        this._defaultConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples("correlation_id", "KafkaConnectionListener", "options.log_level", 1, "options.reconnect", true, "options.check_interval", 60000);
        /**
         * The logger.
         */
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        config = config.setDefaults(this._defaultConfig);
        this._correlationId = config.getAsString("correlation_id");
        this._reconnect = config.getAsBoolean("options.reconnect");
        this._checkInerval = config.getAsInteger("options.check_interval");
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._logger.setReferences(references);
        this.connection = references.getOneRequired(new pip_services3_commons_nodex_1.Descriptor("pip-services", "connection", "kafka", "*", "*"));
    }
    /**
     * Checks if connection listener is open
     * @returns an error is connection is closed or <code>null<code> otherwise.
     */
    isOpen() {
        return this.timer != null;
    }
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isOpen()) {
                return;
            }
            this.timer = new pip_services3_commons_nodex_1.FixedRateTimer(this.checkConnection(this), this._checkInerval, this._checkInerval);
            this.timer.start();
        });
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isOpen()) {
                this.timer.stop();
                this.timer = null;
            }
        });
    }
    checkConnection(context) {
        return () => __awaiter(this, void 0, void 0, function* () {
            try {
                // try to get topics list
                yield context.connection.readQueueNames();
            }
            catch (ex) {
                this._logger.trace(this._correlationId, "Kafka connection is lost");
                // Recreate connection
                if (this._reconnect) {
                    this._logger.trace(this._correlationId, "Try Kafka reopen connection");
                    yield context.connection.close(this._correlationId);
                    yield context.connection.open(this._correlationId);
                }
            }
        });
    }
}
exports.KafkaConnectionListener = KafkaConnectionListener;
//# sourceMappingURL=KafkaConnectionListener.js.map