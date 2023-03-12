import { formatJSONResponse, validateData } from '../../shared/helpers';
import { SwipeDto } from '../swipe/dtos/swipe.dto';
import UserModel from '../../models/user.model';
import PreferenceModel, { Preference } from '../../models/preferences.model';
import { MongoConnection } from '../../shared/mongo-connection';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  await MongoConnection.init();
  const userId = event?.requestContext?.authorizer!.principalId;
  const payload: SwipeDto = JSON.parse(event.body!);
  payload.user = userId;
  const errors = await validateData(payload, SwipeDto);
  if (errors.length) {
    return formatJSONResponse(400, {
      message: errors,
    });
  }
  try {
    const profile = await UserModel.findById(payload.profile);
    if (!profile) {
      return formatJSONResponse(404, {
        message: 'profile was not found',
      });
    }

    const alreadyExist = await PreferenceModel.findOne({
      user: payload.user,
      profile: payload.profile,
    });

    if (alreadyExist) {
      return formatJSONResponse(400, {
        message: 'Record already exist',
      });
    }

    const preference = await PreferenceModel.create(payload);

    profile.attractiveness =
      payload.preference === Preference.YES
        ? profile.attractiveness! + 1
        : profile.attractiveness! - 1;
    await profile.save();

    return formatJSONResponse(200, {
      preference,
    });
  } catch (e) {
    return formatJSONResponse(500, {
      message: 'Internal server error',
    });
  }
};
