import * as cdk from "aws-cdk-lib"
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import dotenv from "dotenv"
import path from "path";


dotenv.config()


const V = process.env.V!;
const PROJECT = process.env.PROJECT!;

export class BroadcastClientLambda extends cdk.Stack {
    public broadCastClientLambda: NodejsFunction;
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        if (!V && !PROJECT) {
            console.error("Error: env file not read");
            return;
        }


        const broadcastClientLambdaName = `ws${PROJECT}broadcastClientLambda${V}`;
        this.broadCastClientLambda = new NodejsFunction(
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
                    "LambdaBroadcastClient",
                    "handler.ts"
                ),
            }
        );

        this.broadCastClientLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ["*"],
                resources: ["*"],
            })
        );
    }
}