import { APIGatewayProxyResult } from "aws-lambda"
import { APIGateway } from "aws-sdk";

export enum HTTP_CODE {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    ERROR = 500,
}

export enum HTTP_METHOD {
    GET = "GET",
    POST = "POST",
    DELETE = "DELETE",
}

export function addCorsHeader(arg: APIGatewayProxyResult) {
    if (!arg.headers) {
        arg.headers = {};
    }
    arg.headers["Access-Control-Allow-origin"] = "*";
    arg.headers["Access-Control-Allow-Methods"] = "*";
}

export const jsonApiProxyResultresponse = (
    statusCode: HTTP_CODE,
    object: any
): APIGatewayProxyResult => {
    const response = {
        statusCode,
        body: JSON.stringify(object),

    };
    addCorsHeader(response);
    return response;
};

export function validateIsoString(dateString: string) {
    const isoFormat =
        /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])[T ](2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(\.\d+)?([zZ]|([+-](2[0-3]|[01][0-9]):?[0-5][0-9]))?$/;
    return isoFormat.test(dateString);
}