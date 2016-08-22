/* jshint esversion:6, node:true, asi:true */
'use strict'

const AWS = require('aws-sdk')
const doc = require('dynamodb-doc')
const https = require('https')

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
const dynamo = new AWS.DynamoDB.DocumentClient()

const DYNAMO_MAX_REQS = 25
const DYNAMO_TABLE = 'Todos' // Replace with your DynamoDB table name

function processRow(row) {
  const data = row.split(',')

  return {
    id: data[0],
    todo: data[1],
    done: data[2] !== '0'
  }
}

function putItems(items) {
  // Map items to dynamodb sdk format
  const puts = items.map(item => ({PutRequest: {Item: item}}))

  // Promisify DynamoDB's callback
  return new Promise((resolve, reject) => {
      var req = {}

      req[DYNAMO_TABLE] = puts

      // Create a batched DynamoDB put request
      dynamo.batchWrite({
        RequestItems: req
      }, (err, data) => err ? reject(err) : resolve(data))
  })
}

exports.handler = (event, context, callback) => {
  // Get the S3 bucket and key from the event
  const bucket = event.Records[0].s3.bucket.name
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))

  // Retrieve updated object from bucket
  s3.getObject({Bucket: bucket, Key: key}, (err, data) => {
      if (err) {
        context.fail(err)
      } else {
        const ops = []

        // Parse CSV rows into data items
        const items = data.Body.toString().split(/\r?\n/)

        // Remove empty tail
        items.pop()

        // Split items by max requests allowed in batch DynamoDB operations
        for (var i = 0; i < items.length; i += DYNAMO_MAX_REQS)
          ops.push(
            // Map each row into a DynamoDB items
            items.slice(i, i + DYNAMO_MAX_REQS).map(processRow)
          )

        // Store data items in dynamodb table
        const requests = ops.map(putItems)

        Promise.all(requests)
          .then(data => {
            console.log(data)
            context.succeed(data)
          })
          .catch(error => {
            console.log(error)
            context.fail(err)
          })
      }
  })
}
