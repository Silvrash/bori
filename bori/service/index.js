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
exports.getParents = exports.getOrganisation = exports.addOrganisation = void 0;
const queryBuilder_1 = require("./queryBuilder");
/**
 * adds organisation
 * @param  {cass.Client} client - cassandra client
 * @param  {Organisation} org - instance of the organisation
 * @param  {string|undefined=undefined} parentId - id of parent
 */
exports.addOrganisation = (client, org, parentId = undefined) => __awaiter(void 0, void 0, void 0, function* () {
    let hierarchypath;
    /**
     * if parent id exists, get grandparents of the parent
     * and add the parent to the hierarchy tree and update
     * the child's ancestor tree
     */
    if (parentId) {
        const parent = yield exports.getOrganisation(client, parentId);
        if (parent.hierarchypath)
            hierarchypath = [...(parent.hierarchypath || []), parent.id];
        else
            hierarchypath = [parent.id];
    }
    org.date_added = new Date();
    yield queryBuilder_1.useQuery(client, 'add-org', [org.id, org.name, org.date_added, hierarchypath]);
    return org;
});
/**
 * get singular organisation
 * @param  {cass.Client} client - cassandra client
 * @param  {string} id - organisation id
 * @returns Promise
 */
exports.getOrganisation = (client, id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield queryBuilder_1.useQuery(client, 'get-org', [id]);
    if (!result || result.length === 0)
        return null;
    return result[0];
});
/**
 * get parents and grandparents of an organisation
 * @param  {cass.Client} client - cassandra client
 * @param  {string} orgId - organisation id
 */
exports.getParents = (client, orgId) => __awaiter(void 0, void 0, void 0, function* () {
    const org = yield exports.getOrganisation(client, orgId);
    if (!org || !org.hierarchypath)
        return null;
    const parents = yield queryBuilder_1.useQuery(client, 'get-orgs', org.hierarchypath);
    return parents;
});
