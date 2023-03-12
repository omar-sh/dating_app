import { MongoConnection } from '../../shared/mongo-connection';
import UserModel, { Gender, User } from '../../models/user.model';
import PreferenceModel, { Preference } from '../../models/preferences.model';
import { handler } from './handler';

describe('Get profiles', () => {
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

  it('Must not return requester profile as part of the profiles', async () => {
    let user1: User = {
      email: 'user1@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: Gender.MALE,
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };

    let user2: User = {
      email: 'user2@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: Gender.MALE,
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };

    user1 = await UserModel.create(user1);
    user2 = await UserModel.create(user2);

    const response: any = await handler({
      requestContext: {
        authorizer: {
          principalId: user1._id?.toString(),
        },
      },
    } as any);
    const body = JSON.parse(response.body);
    expect(body.profiles.length).toBe(1);
    expect(body.profiles[0]._id).not.toBe(user1._id?.toString());
    expect(body.profiles[0]._id).toBe(user2._id?.toString());
  });

  it('Must not return the profile who swiped no for requester', async () => {
    let user1: User = {
      email: 'user1@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: Gender.MALE,
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };

    let user2: User = {
      email: 'user2@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: Gender.MALE,
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };

    user1 = await UserModel.create(user1);
    user2 = await UserModel.create(user2);
    await PreferenceModel.create({
      user: user2._id?.toString(),
      profile: user1._id?.toString(),
      preference: Preference.NO,
    });
    const response: any = await handler({
      requestContext: {
        authorizer: {
          principalId: user1._id?.toString(),
        },
      },
    } as any);
    const body = JSON.parse(response.body);
    expect(body.profiles.length).toBe(0);
  });

  it('Must only return profiles with gender FEMALE', async () => {
    const users = [
      {
        email: 'user1@gmail.com',
        password: '123456',
        name: 'Omar',
        gender: Gender.MALE,
        age: 23,
        location: {
          type: 'Point',
          coordinates: [-0.186531, 10.849069],
        },
      },
      {
        email: 'user2@gmail.com',
        password: '123456',
        name: 'Omar',
        gender: Gender.FEMALE,
        age: 23,
        location: {
          type: 'Point',
          coordinates: [-0.186531, 10.849069],
        },
      },
    ];

    await UserModel.insertMany(users);

    let user: User = {
      email: 'user3@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: Gender.FEMALE,
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };
    user = await UserModel.create(user);
    const response: any = await handler({
      requestContext: {
        authorizer: {
          principalId: user._id?.toString(),
        },
      },
      queryStringParameters: {
        gender: Gender.FEMALE,
      },
    } as any);
    const body = JSON.parse(response.body);
    expect(body.profiles.length).toBe(1);
    expect(body.profiles[0].gender).toBe(Gender.FEMALE);
  });

  it('Must only return profile with minAge 25', async () => {
    const users = [
      {
        email: 'user1@gmail.com',
        password: '123456',
        name: 'Omar',
        gender: Gender.MALE,
        age: 30,
        location: {
          type: 'Point',
          coordinates: [-0.186531, 10.849069],
        },
      },
      {
        email: 'user2@gmail.com',
        password: '123456',
        name: 'Omar',
        gender: Gender.FEMALE,
        age: 23,
        location: {
          type: 'Point',
          coordinates: [-0.186531, 10.849069],
        },
      },
    ];

    await UserModel.insertMany(users);

    let user: User = {
      email: 'user3@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: Gender.FEMALE,
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };
    user = await UserModel.create(user);
    const response: any = await handler({
      requestContext: {
        authorizer: {
          principalId: user._id?.toString(),
        },
      },
      queryStringParameters: {
        minAge: 25,
      },
    } as any);
    const body = JSON.parse(response.body);
    expect(body.profiles.length).toBe(1);
    expect(body.profiles[0].age).toBe(30);
  });

  it('Must only return profile with maxAge 19', async () => {
    const users = [
      {
        email: 'user1@gmail.com',
        password: '123456',
        name: 'Omar',
        gender: Gender.MALE,
        age: 18,
        location: {
          type: 'Point',
          coordinates: [-0.186531, 10.849069],
        },
      },
      {
        email: 'user2@gmail.com',
        password: '123456',
        name: 'Omar',
        gender: Gender.FEMALE,
        age: 23,
        location: {
          type: 'Point',
          coordinates: [-0.186531, 10.849069],
        },
      },
    ];

    await UserModel.insertMany(users);

    let user: User = {
      email: 'user3@gmail.com',
      password: '123456',
      name: 'Omar',
      gender: Gender.FEMALE,
      age: 23,
      location: {
        type: 'Point',
        coordinates: [-0.186531, 10.849069],
      },
    };
    user = await UserModel.create(user);
    const response: any = await handler({
      requestContext: {
        authorizer: {
          principalId: user._id?.toString(),
        },
      },
      queryStringParameters: {
        maxAge: 19,
      },
    } as any);
    const body = JSON.parse(response.body);
    expect(body.profiles.length).toBe(1);
    expect(body.profiles[0].age).toBe(18);
  });
});
