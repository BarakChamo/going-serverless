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
  5. [Test S3 and Lambda Configuration](#test-s3-and-lambda-configuration)

- [REST API](#rest-api)
- 1. [Deploy a Swagger Schema](#deploy-a-swagger-schema)
  2. [Create API Gateway API](#create-api-gateway-api)
    1. [Create root API `GET`](#create-root-api-get)
    2. [Create Nested API methods](#create-nested-api-methods)
  3. [Deploy an API](#deploy-an-api)
  4. [API Gateway Access Control](#api-gateway-access-control)

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

Once the `todos.csv` file has been uploaded to the bucket, you can test the Lambda through the editor:

1. Go to the [Lambda Console](https://console.aws.amazon.com/lambda/home?#/functions) and enter your Lambda 
2. Click `Actions` and `Configure Test Event`
3. Paste the contents of the [example test JSON](./example/backend/lambda-test.json)
4. Press `Test` or `Save and Test`


<br/>
That's it, our backing service configuration is now complete, we can upload data, it'll be automatically processed and put into our data store. Now let's move on to the API.


## REST API

### Deploy a Swagger schema

Swagger is a JSON-based schema for describing APIs. API Gateway accepts Swagger to initialize APIs.

To import the API from a ready-made Swagger file:

1. Download the [example Swagger schema](./example/api/schema/todos-prod-swagger-integrations,authorizers.json)
2. Find and replace all instances of `{{ARN}}` with your IAM Role's ARN as created in Step 1 of this tutorial
3. Go to the [API Gateway console](https://console.aws.amazon.com/apigateway/home#/apis/create)
4. Check `Import From Swagger`
5. Paste the updated Swagger spec in the editor and click `Import`
6. Click on `Actions` and `Deploy API`
7. Done!

### Create API Gateway API

Now that our data store is set up, let's define out RESTful API endpoints.

1. Go to the [API Gateway console](https://console.aws.amazon.com/apigateway/home#/apis/create)
2. Check `New API`
3. Give your API a name, for example: `todos`

### Create Root API `GET`

Now we create the root API `GET` method. API Gateway will contact DynamoDB directly to retrieve the records, no code at all is needed in the process.

To map the request from the API to DynamoDB:

1. Click on `Actions` and `Create Method`
2. In the dropdown select `GET` and confirm
3. Select `Show Advanced` and `AWS Service Proxy`
4. Choose your AWS region
5. Choose `DynamoDB` in `AWS Service`
6. In `HTTP Method` choose `POST`
7. Enter `Scan` in `Action`
8. In `Execution Role` enter the `ARN` of the role created earlier (i.e. todoRole) available in the `IAM` console.
9. Confirm the method and click `Integration Request`
10. Expand `Body Mapping Templates` and click `Add mapping template`
11. In the input field, enter `application/json` and confirm
12. In the editor to the right, enter the JSON mapping template from the [example file](./example/api/get-template.json)
13. Update the table name and index (i.e. `Todos` and `id-index`)
14. Save the mapping by clicking `Save`

<br/>
To map the response from DynamoDB to our API format:

1. Click `Integration Response`
2. Expand the `200` row and in it, the `Body Mapping Templates` row
3. Click on `application/json`
4. In the editor to the right, enter the JSON mapping template from the [example file](./example/api/response-mapping)
5. Save the mapping by clicking `Save`

### Create Nested API methods

Now that we can retrieve all items, let's create the indidual `REST` operations

#### Create the `todos/{id}` resource

1. Click `Actions` and `Create Resource`
2. give the resource a name
3. In `Resource Path` enter `{id}`,  the value will be mapped as the `id` input variable
4. Click `Create Resource` to confirm

#### GET `/{id}`

1. Click on `/{id}` then click on `Actions` and `Create Method`
2. In the dropdown select `GET` and confirm
3. Select `Show Advanced` and `AWS Service Proxy`
4. Choose your AWS region
5. Choose `DynamoDB` in `AWS Service`
6. In `HTTP Method` choose `POST`
7. Enter `Query` in `Action`
8. In `Execution Role` enter the `ARN` of the role created earlier (i.e. todoRole) available in the `IAM` console.
9. Confirm the method and click `Integration Request`
10. Expand `Body Mapping Templates` and click `Add mapping template`
11. In the input field, enter `application/json` and confirm
12. In the editor to the right, enter the JSON mapping template from the [example file](./example/api/get-id-template.json)
13. Update the table name and index (i.e. `Todos` and `id-index`)
14. Save the mapping by clicking `Save`

<br/>
To map the response from DynamoDB to our API format:

1. Click `Integration Response`
2. Expand the `200` row and in it, the `Body Mapping Templates` row
3. Click on `application/json`
4. In the editor to the right, enter the JSON mapping template from the [example file](./example/api/response-mapping)
5. Save the mapping by clicking `Save`


#### POST `/{id}`

`To be completed`

#### DELETE `/{id}`

`To be completed`

### Deploy an API

To deploy our newly created API we need to set it to an API stage:

1. Click on `Actions` and `Deploy API`
2. Select a deployment stage
3. Name the stage and give it a description
4. Click `Deploy`
5. To test the API, click on the url under `Invoke URL`

### API Gateway Access Control

To protect our API from unwanted access we can enable access control using API keys:

1. Click on `API Keys` on the left panel
2. Click on `Actions` and `Create API Key`
3. Give the key a name and choose `Auto Generate`
4. Click `Save`
5. Under `Select API` and `Select Stage` choose the newly created API and Stage to enable the key for them
6. Click `Add`
7. To view the API key, click `Show` next to `API Key`
8. Now re-deploy as per the instructions above
9. To access protected endpoints, add the `x-api-key` and set its value to the API Key you created
