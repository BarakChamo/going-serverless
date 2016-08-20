/* jshint esversion:6, node:true, asi:true */
'use strict'

const aws = require('aws-sdk')
const doc = require('dynamodb-doc')
const https = require('https')

const s3 = new aws.S3({ apiVersion: '2006-03-01' })
const dynamo = new doc.DynamoDB()

function processRow(row){
    console.log(row)
}

exports.handler = (event, context, callback) => {
    console.log(JSON.stringify(event));
  // Get the S3 bucket and key from the event
  const bucket = event.Records[0].s3.bucket.name
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))

  // Retrieve updated object from bucket
  s3.getObject({Bucket: bucket, Key: key}, (err, data) => {
      if (err) {
        // Failed to retrieve stock file
        console.log('ERROR',err)
        context.fail(err)
        callback(err)
      } else {
        // Parse CSV rows
        data.Body.toString().split(/\r?\n/).forEach(processRow)

        // callback(null, 'products')
      }
  })
}
