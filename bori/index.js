"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = __importDefault(require("commander"));
const figlet_1 = __importDefault(require("figlet"));
const uuid_1 = require("uuid");
const db_1 = require("./db");
const service = __importStar(require("./service"));
console.log(chalk_1.default.green(figlet_1.default.textSync('backend test', { horizontalLayout: 'full' })));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    commander_1.default
        .version('0.0.1')
        .description('A cli application for blue ocean robotics test')
        .option('-a, --add <string>', 'add an organisation')
        .option('-f, --find <string>', 'find organisation by id')
        .option('-p, --parentId <string>', 'set parent id: use together with --add`')
        .parse(process.argv);
    const db = db_1.getDatabaseClient();
    if (commander_1.default.add) {
        const organisation = {
            name: commander_1.default.add,
            id: uuid_1.v4(),
            date_added: new Date()
        };
        const parentId = commander_1.default.parentId;
        const result = yield service.addOrganisation(db, organisation, parentId);
        console.log(result);
    }
    else if (commander_1.default.find) {
        const result = yield service.getParents(db, commander_1.default.find);
        if (!result)
            console.log('No parents');
        else
            console.log(result.map(org => org.name).join(', '));
    }
    else {
        commander_1.default.outputHelp();
    }
    yield db.shutdown();
});
main().catch(e => {
    console.log(e);
    process.exit();
});
