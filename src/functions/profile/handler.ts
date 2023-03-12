import UserModel from '../../models/user.model';
import { MongoConnection } from '../../shared/mongo-connection';
import { formatJSONResponse, validateData } from '../../shared/helpers';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import { ProfileDto } from './dtos/profile.dto';
import PreferenceModel from '../../models/preferences.model';
import { Preference } from '../../models/preferences.model';

const buildFilterObject = (queryParams: ProfileDto) => {
  let filterObject: any = {};
  if (queryParams.gender) {
    filterObject = {
      ...filterObject,
      gender: queryParams.gender,
    };
  }
  if (queryParams.minAge) {
    filterObject = {
      ...filterObject,
      age: {
        $gte: queryParams.minAge,
      },
    };
  }
  if (queryParams.maxAge) {
    filterObject = {
      ...filterObject,
      age: {
        ...filterObject.age,
        $lte: queryParams.maxAge,
      },
    };
  }
  return filterObject;
};

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const client = await MongoConnection.init();
  const queryParams: ProfileDto = event.queryStringParameters || {};
  const errors = await validateData(queryParams, ProfileDto);
  if (errors.length) {
    return formatJSONResponse(400, {
      message: errors,
    });
  }
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 3;

  const userId = event?.requestContext?.authorizer!.principalId;

  try {
    const user = await UserModel.findById(userId);
    const filterObject = buildFilterObject(queryParams);
    const preferences = await PreferenceModel.find({
      $or: [
        { user: userId },
        {
          profile: userId,
          preference: Preference.NO,
        },
      ],
    });
    const excludedIds = preferences.map((item) => {
      if (
        item.profile?.toString() === userId &&
        item.preference === Preference.NO
      ) {
        return item.user;
      }
      return item.profile;
    });

    let maxDistance = {};

    if (queryParams.maxDistance) {
      maxDistance = {
        $maxDistance: queryParams.maxDistance,
      };
    }
    const profiles = await UserModel.find({
      ...filterObject,
      $and: [
        {
          _id: {
            $ne: userId,
          },
        },
        { _id: { $nin: excludedIds } },
      ],
      location: {
        $near: {
          $geometry: {
            type: user?.location?.type,
            coordinates: user?.location?.coordinates,
          },
          ...maxDistance,
        },
      },
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ attractiveness: -1, _id: 1 });
    return formatJSONResponse(200, {
      profiles,
      page: page,
      pageSize: profiles.length,
    });
  } catch (e) {
    return formatJSONResponse(500, {
      message: 'Internal Server Error',
    });
  }
};
