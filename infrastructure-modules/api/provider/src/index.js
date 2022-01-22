'use strict';

exports.handler = (event, context, callback) => {
    console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
    console.log("EVENT\n" + JSON.stringify(event, null, 2))
    callback(null, {"statusCode": 200, "body": "results"})
}
