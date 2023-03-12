import { CreateUserDto } from './dtos/create-user.dto';
import UserModel from '../../models/user.model';
import { MongoConnection } from '../../shared/mongo-connection';
import { formatJSONResponse, validateData } from '../../shared/helpers';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  await MongoConnection.init();
  const payload: CreateUserDto = JSON.parse(event.body!);
  const errors = await validateData(payload, CreateUserDto);
  if (errors.length) {
    return formatJSONResponse(400, {
      message: errors,
    });
  }
  try {
    const isExist = await UserModel.findOne({
      email: payload.email,
    });
    if (isExist) {
      return formatJSONResponse(400, {
        message: `user with email ${[payload.email]} already existing`,
      });
    }
    const user = await UserModel.create(payload);
    return formatJSONResponse(200, {
      user,
    });
  } catch (e) {
    return formatJSONResponse(500, {
      message: 'Internal server error',
    });
  }
};
