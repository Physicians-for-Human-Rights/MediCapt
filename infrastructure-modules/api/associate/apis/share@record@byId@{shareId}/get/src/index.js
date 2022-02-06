'use strict'

exports.handler = (event, context, callback) => {
  console.log('CB\n' + callback)
  console.log('CONTEXT\n' + JSON.stringify(context, null, 2))
  callback(null, {
    statusCode: 200,
    body: JSON.stringify([process.env, event, context], null, 2),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  })
}
