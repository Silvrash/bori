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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inQuery = exports.getDatabaseClient = void 0;
const cassandra_driver_1 = __importDefault(require("cassandra-driver"));
// tslint:disable-next-line: no-var-requires
require('dotenv').config(); // load .env environment vars
/**
 * get a client instance of the database
 */
exports.getDatabaseClient = () => {
    return new cassandra_driver_1.default.Client({
        contactPoints: process.env.CASSANDRA_CLUSTERS.split(','),
        localDataCenter: 'datacenter1',
        keyspace: 'bori'
    });
};
/**
 * Execute prepared query
 *
 * Prepared statements are parsed and prepared on the Cassandra nodes
 * and are ready for future execution.
 * Also, when preparing, the driver retrieves information about
 * the parameter types which allows an accurate mapping
 * between a JavaScript type and a Cassandra type.
 * @param  {cass.Client} client - cassandra client instance
 * @param  {string} preparedQuery - query string
 * @param  {Array<string|number|boolean>} params? - query parameters
 */
const runPreparedQuery = (client, preparedQuery, params) => {
    return client.execute(preparedQuery, params, { prepare: true });
};
/**
 * Higher order function which executes a query string
 * within the scope of the cassandra database
 * @param  {(type:string,params?:any[])=>string} queryBuilder
 */
exports.inQuery = (queryBuilder) => {
    return (client, type, params) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield runPreparedQuery(client, queryBuilder(type, params), params);
        return result.rows;
    });
};
