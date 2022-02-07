'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
aws_sdk_1.default.config.update({
    region: process.env.AWS_REGION,
});
const handler = async (event, context) => {
    console.log('ENVIRONMENT VARIABLES\n' + JSON.stringify(process.env, null, 2));
    console.log('EVENT\n' + JSON.stringify(event, null, 2));
    console.log('CONTEXT\n' + JSON.stringify(context, null, 2));
    return {
        statusCode: 200,
        body: JSON.stringify([process.env, event, context], null, 2),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };
};
exports.handler = handler;
