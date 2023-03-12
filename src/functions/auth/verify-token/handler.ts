import jwt from 'jsonwebtoken';
import { APIGatewayProxyResult } from 'aws-lambda';
import { MongoConnection } from '../../../shared/mongo-connection';
import UserModel from '../../../models/user.model';

export const handler = async (event: any) => {
  const client = await MongoConnection.init();

  const token = event.headers.Authorization;

  try {
    const decoded = await jwt.decode(token);

    const user = await UserModel.findById(decoded._id);
    if (!user) {
      return generatePolicy(null, 'Deny', event.methodArn);
    }

    const policy = decoded ? 'Allow' : 'Deny';

    return generatePolicy(decoded._id, policy, event.methodArn);
  } catch {
    return generatePolicy(null, 'Deny', event.methodArn);
  }
};

/**
 * @description Creates the IAM policy for the response.
 */
const generatePolicy = (principalId: any, effect: any, resource: any) => {
  const authResponse: any = {
    principalId,
  };

  if (effect && resource) {
    const policyDocument: any = {
      Version: '2012-10-17',
      Statement: [],
    };

    const statement = {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource,
    };

    policyDocument.Statement[0] = statement;
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
};
