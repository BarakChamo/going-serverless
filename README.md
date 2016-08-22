# Going Serverless

A workshop on reactive architectures, lambdas and "serverless" systems.

## What are serverless applications?

<p><strong>Serverless</strong> applications utilize (yet another) layer of <strong>PaaS abstraction</strong>, giving up the traditional <strong>"server"</strong> for a <strong>component-based</strong> architecture that focuses on small pieces of functionality.</p>

### Application architecture
<img src="https://github.com/BarakChamo/going-serverless/blob/master/images/schema-grid.png?raw=true" />

<br>
## Prerequisites

While many PAAS providers support "lambdas" and "API gateways" under different names, this workshop will focus on AWS's implementation for demonstration purposes. We will be using AWS `Lambda`, `API Gateway` and `S3` to build a small serverless API.

To follow along, you'll require a free [AWS account](https://aws.amazon.com/free)

You can review alternative providers for your own projects [here]().

<br>
## Following the presentation

You can follow the presentation slides here: [barakchamo.github.io/going-serverless](https://barakchamo.github.io/going-serverless)


## Workshop Steps

In this workshop we'll be creating a functional backend for a `TODO` app, not very exciting but a very good example of API design with serverless technologies.

The workshop steps are:

- [Backing Service](#backing-service)
  1. [Setup Roles and Permissions](#roles-and-permissions)
  2. [Create S3 Bucket](#create-s3-bucket)
  3. [Create DynamoDB Table](#create-dynamo-db-table)
  4. [Create Lambda File Upload Handler](#create-lambda-file-upload-handler)

- [REST API](#rest-api)
  1. one
  2. two
  3. three

- [Front-end](#front-end)

## Backing Service

### Roles and Permissions

Let's start by creating an IAM role that will have sufficient permissions to run all services needed for our app:

1. Go to the [IAM console](https://console.aws.amazon.com/iam/home#roles) and click `Create New Role`
2. Name the role, for example: `todoRole`.
3. From `AWS Service Roles` choose `AWS Lambda`.
4. Select the following permissions (they are quite loose but this is just an example)
  1. AWSLambdaFullAccess
  2. AmazonS3FullAccess
  3. AmazonDynamoDBFullAccess
  4. CloudWatchLogsFullAccess
  5. AmazonAPIGatewayInvokeFullAccess
5. You can also skip the permission selection and paste the JSON from [the example file](./example/roles/policy.json) in `Inline Policies`.
6. Go to the `Trust Relationships` tab and click `Edit Trust Relationship`, paste the [example JSON](./example/roles/entities.json) in and save.


### Create S3 Bucket

Create an S3 bucket in which we'll drop the batch update files that will be processed by our Lambda function.

1. Go to the [S3 Console](https://console.aws.amazon.com/s3/home)
2. Click `Create Bucket`
3. Name the bucket, for example: `serverlesstodobucket`
4. Create the bucket

### Create Dynamo DB Table

Next, let's create a DynamoDB table that will serve as the data store for our app.

1. Go to the [DynamoDB console](https://console.aws.amazon.com/dynamodb/home#tables)
2. Click `Create Table`
3. Name the table, for example: `Todos`
4. Set the primary key to `id`
5. Click `Create`
6. Once the table is created,  navigate to the `indexes` tab
7. Click `Create Index`
8. Set `primary key` to `id`
9. Make sure `index name` is `id-index`
10. Click `Create index`

### Create Lambda file upload handler

To easily populate our backend with batch data, let's write a `Lambda` function that will be called on CSV uploads to our S3 bucket and `PUT` the records in out DynamoDB table.

This Lambda will be called automatically every time a file is uploaded to S3, things are starting to get serverless!

1. Go to the [Lambda Console](https://console.aws.amazon.com/lambda/home?#/functions)
2. Click `Create a Lambda Function`
3. Click `Skip` to skip the blueprints
4. Click on the dashed square and select S3 to asign an S3 event trigger source
5. Choose the S3 bucket you created before (i.e. `serverlesstodobucket`)
6. In `Event Type` choose `Object Created (All)`
7. In `suffix` enter `csv`, this will guarantee the lambda is only called when CSV files are uploaded
8. Check `Enable Trigger` and click `Next`
9. Choose a name for the Lambda, for example `todoBatchUpload`
10. In the editor, enter the code from the [example Lambda handler](./example/backend/handler.js)
11. Replace the [`DYNAMO_TABLE`](https://github.com/BarakChamo/going-serverless/blob/master/example/backend/handler.js#L12) variable with your chosen table name 
11. In `Existing Role`, choose the role you created earlier (i.e. `todoRole`)
12. Click `Next` and `Create Function`

### Test S3 and Lambda Configuration

Now that our batch upload pipeline is in place let's test it out.

1. Download the [`todos.csv`](./example/data/todos.csv) file to your computer
2. Go to the [S3 Console](https://console.aws.amazon.com/s3/home) and enter your created bucket
3. Click `Upload` and upload `todos.csv` to your S3 bucket
4. If you go to the [DynamoDB console](1. Go to the [DynamoDB console](https://console.aws.amazon.com/dynamodb/home#tables)) and enter your created table, the `Items` tab should contain the newly created items from the CSV file 
5. Once the todos.csv

