'use strict';

exports.handler = (event, context, callback) => {
    console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
    console.log("EVENT\n" + JSON.stringify(event, null, 2))
    console.log("CONTEXT\n" + JSON.stringify(context, null, 2))
    callback(null, {"statusCode": 200,
                    "body": JSON.stringify(
                        [process.env, event, context],
                        null, 2),
                    "headers": {
                        "Access-Control-Allow-Origin": "*"
                    }})
}
