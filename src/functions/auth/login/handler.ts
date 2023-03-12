import { APIGatewayProxyEvent } from 'aws-lambda';
import { MongoConnection } from '../../../shared/mongo-connection';
import { formatJSONResponse, validateData } from '../../../shared/helpers';
import UserModel from '../../../models/user.model';
import { LoginDto } from './dtos/login.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
const privateKey = process.env.PRIVATE_KEY;
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const client = await MongoConnection.init();
  const payload: LoginDto = JSON.parse(event.body!);

  try {
    const user = await UserModel.findOne({
      email: payload.email,
    });
    if (!user) {
      return formatJSONResponse(401, {
        message: `Unauthorized`,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      payload.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      return formatJSONResponse(401, {
        message: 'Unauthorized',
      });
    }

    const token = jwt.sign(user.toJSON(), privateKey);
    return formatJSONResponse(200, {
      user,
      token,
    });
  } catch (e) {
    console.log('ERR', e);
    return formatJSONResponse(500, {
      message: 'Internal server error',
    });
  }
};
