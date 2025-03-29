import {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi"

interface Location{
    type: string;
    coordinates: [number, number]
}

export const handler = async (
    event: WSMessage
): Promise<ApiGate  