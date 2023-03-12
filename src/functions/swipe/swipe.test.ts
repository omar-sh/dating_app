import { MongoConnection } from '../../shared/mongo-connection';
import UserModel from '../../models/user.model';
process.env.PRIVATE_KEY = 'secret';
import { handler } from './handler';
import mongoose from 'mongoose';
import { Preference } from '../../models/preferences.model';

describe('Login', () => {
  beforeAll((done) => {
    MongoConnection.init().then(() => {
      done();
    });
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await MongoConnection.close();
  });

  it('Must fail when invalid payload is sent', async () => {
    const response = await handler({
      body: JSON.stringify({}),
    } as any);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toStrictEqual([
      'profile should not be empty',
      'profile must be a string',
      'preference should not be empty',
      'preference must be one of the following values: YES, NO',
    ]);
  });

  it('Must fail when sending un existing profile', async () => {
    const response = await handler({
      body: JSON.stringify({
        profile: '6009c0eee65f6dce28fb3e50',
        preference: Preference.YES,
      }),
    } as any);
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).message).toBe('profile was not found');
  });

  it('Must succeed and increase attractiveness when swiping yes', async () => {
    let user: any = {
      email: 'omar10@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: 'MALE',
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };

    user = await UserModel.create(user);

    let profile: any = {
      email: 'profile0@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: 'MALE',
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };

    profile = await UserModel.create(profile);

    const response = await handler({
      body: JSON.stringify({
        profile: profile._id.toString(),
        preference: Preference.YES,
      }),
      requestContext: {
        authorizer: { principalId: user._id.toString() },
      },
    } as any);
    profile = await UserModel.findById(profile._id);
    expect(profile.attractiveness).toBe(1);
    expect(response.statusCode).toBe(200);
  });

  it('Must succeed and decrease attractiveness by 1 when swiping yes', async () => {
    let user: any = {
      email: 'omar10@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: 'MALE',
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };

    user = await UserModel.create(user);

    let profile: any = {
      email: 'profile0@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: 'MALE',
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };

    profile = await UserModel.create(profile);

    const response = await handler({
      body: JSON.stringify({
        profile: profile._id.toString(),
        preference: Preference.NO,
      }),
      requestContext: {
        authorizer: { principalId: user._id.toString() },
      },
    } as any);
    profile = await UserModel.findById(profile._id);
    expect(profile.attractiveness).toBe(-1);
    expect(response.statusCode).toBe(200);
  });
});
