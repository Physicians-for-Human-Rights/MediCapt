"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const crypto_1 = __importDefault(require("crypto"));
const filter_js_1 = __importDefault(require("lodash/filter.js"));
const isEmpty_1 = __importDefault(require("lodash/isEmpty"));
const includes_1 = __importDefault(require("lodash/includes"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.update({
    region: process.env.AWS_REGION,
});
var dynamodb = new aws_sdk_1.default.DynamoDB({ apiVersion: '2012-08-10' });
const alphabet = '134789ABCDEFGHJKLMNOPQRSTUWXYZ';
function generate_humanid_of_size(prefix, n) {
    let output = '' + prefix + n;
    for (let i = 0; i < n * 3 - 1; i++) {
        if (i % 3 === 0) {
            output += '-';
        }
        output += alphabet[crypto_1.default.randomInt(0, 30)];
    }
    const c = (0, filter_js_1.default)(crypto_1.default
        .createHash('md5')
        .update(output)
        .digest('hex')
        .toUpperCase(), d => (0, includes_1.default)(alphabet, d));
    if ((0, isEmpty_1.default)(c)) {
        console.log('Generated md5 without a single good digit', output, c);
        throw 'Generated md5 without a single good digit';
    }
    return output + c[0];
}
async function create_humanid_of_size(prefix, n, machineId) {
    const humanId = generate_humanid_of_size(prefix, n);
    const ret = await dynamodb
        .transactWriteItems({
        TransactItems: [
            {
                Put: {
                    Item: {
                        id1: {
                            S: humanId,
                        },
                        id2: {
                            S: machineId,
                        },
                    },
                    TableName: process.env.humanid_table_name,
                    ConditionExpression: 'attribute_not_exists(id1)',
                    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
                },
            },
            {
                Put: {
                    Item: {
                        id1: {
                            S: machineId,
                        },
                        id2: {
                            S: humanId,
                        },
                    },
                    TableName: process.env.humanid_table_name,
                    ConditionExpression: 'attribute_not_exists(id1)',
                    ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
                },
            },
        ],
    })
        .promise();
    if (ret.$response.error) {
        console.error('dynamo', ret);
        throw ret;
        return null;
    }
    else {
        return humanId;
    }
}
let cacheTable = {};
const handler = async (event) => {
    switch (event.action) {
        case 'machineID-to-humanID': {
            const { machineID, suggestedPrefix } = event;
            if (machineID === undefined || suggestedPrefix === undefined)
                throw new Error('Malformed action');
            const data = await dynamodb
                .getItem({
                TableName: process.env.humanid_table_name,
                Key: {
                    id1: { S: machineID },
                },
            })
                .promise();
            if (data.Item && data.Item.id2 && data.Item.id2.S) {
                return { machineID, humanID: data.Item.id2.S };
            }
            else {
                let data;
                for (let n = 3; n < 6; n++) {
                    if (!cacheTable[suggestedPrefix] ||
                        cacheTable[suggestedPrefix] <= n) {
                        for (let retry = 0; retry < 2; retry++) {
                            data = await create_humanid_of_size(suggestedPrefix, n, machineID);
                            if (data) {
                                cacheTable[suggestedPrefix] = n;
                                return { machineID, humanID: data };
                            }
                        }
                    }
                }
                throw new Error('Failed to generate a humanID' + JSON.stringify(data));
            }
        }
        case 'humanID-to-machineID': {
            const { humanID } = event;
            if (humanID === undefined) {
                throw new Error('Malformed action');
            }
            // Look up the humanID
            const data = await dynamodb
                .getItem({
                TableName: process.env.humanid_table_name,
                Key: {
                    id1: { S: humanID },
                },
            })
                .promise();
            if (data.Item && data.Item.id2 && data.Item.id2.S) {
                return { humanID, machineID: data.Item.id2.S };
            }
            else {
                return { failure: 'NOT_FOUND' };
            }
        }
        default:
            throw new Error('Not a supported action');
    }
};
exports.handler = handler;
exports.default = exports.handler;
