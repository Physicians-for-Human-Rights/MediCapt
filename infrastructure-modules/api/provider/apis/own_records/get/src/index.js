'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

exports.handler = async (event, context, callback) => {
    console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
    console.log("EVENT\n" + JSON.stringify(event, null, 2))
    console.log("CONTEXT\n" + JSON.stringify(context, null, 2))

    let worked
    var params = { 
        Bucket: 'barbu-test-bucket-1'
    }
    try {
        worked = await s3.listObjectsV2(params).promise();
        console.log(worked)
    } catch (e) {
        console.log(e)
        worked = e
    }

    callback(null, {"statusCode": 200,
                    "body": JSON.stringify(
                        [worked, process.env, event, context],
                        null, 2),
                    "headers": {
                        "Access-Control-Allow-Origin": "*"
                    }})
}
