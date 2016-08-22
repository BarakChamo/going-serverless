# Going Serverless

A workshop on reactive architectures, lambdas and "serverless" systems.

## What are serverless applications?

<p><strong>Serverless</strong> applications utilize (yet another) layer of <strong>PaaS abstraction</strong>, giving up the traditional <strong>"server"</strong> for a <strong>component-based</strong> architecture that focuses on small pieces of functionality.</p>

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

1. Go to the [DynamoDB console]()
2. Click `Create Table`
3. Name the table, for example: `Todos`
4. Set the primary key to `id`
5. Click `Create`
6. 

### Create Lambda file upload handler
