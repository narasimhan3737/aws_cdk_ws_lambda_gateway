import * as cdk from "aws-cdk-lib"
import { PartitionKey } from "aws-cdk-lib/aws-appsync";
import { AttributeType, Billing, BillingMode, ProjectionType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as dotenv from "dotenv"
import path from "path";

dotenv.config();

const V = process.env.V!;
const PROJECT = process.env.PROJECT!;

export class RegisterConnectionIdLambda extends cdk.Stack {
    public RegisterConnectionLambda: NodejsFunction;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        if (!V && !PROJECT) {
            console.error("Error: env file not read");
            return;
        }

        const table = new Table(this, `${PROJECT}RegisterConnectionIdTable${V}`, {
            tableName: `${PROJECT}RegisterConnectionIdTable${V}`,
            partitionKey: {
                type: AttributeType.STRING,
                name: "id",
            },
            sortKey: {
                name: "site",
                type: AttributeType.STRING,

            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        table.addGlobalSecondaryIndex({
            indexName: "connectionId",
            partitionKey: {
                name: "connectionIdIndex",
                type: AttributeType.STRING,
            },
            projectionType: ProjectionType.ALL,
        });

        const broadcastClientLambdaName = `${PROJECT}RegisterConnectionIdlambda${V}`;
        this.RegisterConnectionLambda = new NodejsFunction(
            this,
            broadcastClientLambdaName,
            {
                functionName: broadcastClientLambdaName,
                runtime: Runtime.NODEJS_20_X,
                handler: "handler",
                entry: path.join(
                    __dirname,
                    "..",
                    "src",
                    "lambdas",
                    "lambdaRegisterConnectionId",
                    "handler.ts"
                ),
                environment: {
                    TABLE_NAME: table.tableName,
                    TABLE_ARN: table.tableArn,
                },
            }
        );

        this.RegisterConnectionLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ["*"],
                resources: ["*"],
            })
        );
    }
}