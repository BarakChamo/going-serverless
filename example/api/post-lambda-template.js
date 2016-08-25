const AWS = require('aws-sdk')
const doc = require('dynamodb-doc')

const dynamo = new AWS.DynamoDB.DocumentClient()
const DYNAMO_TABLE = 'Todos'

exports.handler = (event, context, callback) => {
  const params = {
    TableName : DYNAMO_TABLE,
    Item: {
      id: context.awsRequestId,
      todo: event.todo,
      done: event.done
    }
  }

  dynamo.put(params, function(err, data) {
    if (err) context.fail(err)
    else context.succeed(data)
  })

}
