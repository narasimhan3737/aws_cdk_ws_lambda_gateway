import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { ApiKey, Cors, LambdaIntegration, MethodOptions, Period, ResourceOptions, RestApi, UsagePlan } from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Lambda } from "aws-sdk";
import { Construct } from "constructs";
import * as dotenv from "dotenv"
import { HTTP_METHOD } from "../src/utils";
dotenv.config();

const V = process.env.V!;
const PROJECT = process.env.PROJECT!;

export interface ApiGatewaybroadcastProps extends StackProps{
    broadCastLambda: NodejsFunction;
    registerConnectionLambda: NodejsFunction;
}

export class ApiGatewayBroadcast extends Stack{
    private api: RestApi;
    constructor(scope: Construct, id: string, props: ApiGatewaybroadcastProps) {
        super(scope,id ,props);

        const restApiName = `${PROJECT}ApiGatewaybroadcastProps${V}`;
        this.api = new RestApi(this, restApiName);

        const optionsWithCors: ResourceOptions = {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
            },
        };

        const broadcastLambdaIntegration = new LambdaIntegration(
            props.broadCastLambda
        );

        const RegisterConnectionIdLambdaIntegration = new LambdaIntegration(
            props.registerConnectionLambda
        );

        const methodOptionsWithApiKeyRequired: MethodOptions = {
            apiKeyRequired: true,
        };

        const apiResources = this.api.root.addResource("event", optionsWithCors);
        apiResources.addMethod(HTTP_METHOD.POST, broadcastLambdaIntegration);

        const registerResources = this.api.root.addResource(
            "connectionid",
            optionsWithCors
        );

        registerResources.addMethod(
            HTTP_METHOD.POST,
            RegisterConnectionIdLambdaIntegration,
            methodOptionsWithApiKeyRequired
        );

        registerResources.addMethod(
            HTTP_METHOD.GET,
            RegisterConnectionIdLambdaIntegration,
            methodOptionsWithApiKeyRequired
        );

        registerResources.addMethod(
            HTTP_METHOD.DELETE,
            RegisterConnectionIdLambdaIntegration,
            methodOptionsWithApiKeyRequired
        );

        //Create an API Key
        const apiKey = new ApiKey(this, "hariApiKeyBroadcastApi", {
            apiKeyName: `${PROJECT}ApiKeyBroadcast`
        })

        //Cretae a Usage Plan
        const usagePlan = new UsagePlan(this, "UsagePlan",{
            name: `${PROJECT}UsagePlan${V}`,
            description: "Usage plan for the API",
            apiStages: [
                {
                    api: this.api,
                    stage: this.api.deploymentStage,
                },
            ],
            throttle: {
                rateLimit:100,
                burstLimit:200,
            },
            quota: {
                limit:100000,
                period: Period.MONTH,
            },
        });

        usagePlan.addApiKey(apiKey);

        new CfnOutput(this, "ApiKeyValue",{
            value: apiKey.keyId,
            description: "The API key for accessing the REST API",
        });
        new CfnOutput(this, `${restApiName}UrlValue`,{
            value: this.api.url,
        })

        
    }
    
}