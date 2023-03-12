import { MongoConnection } from '../../shared/mongo-connection';
import UserModel from '../../models/user.model';
import { handler } from './handler';

describe('Create user', () => {
  beforeAll((done) => {
    MongoConnection.init().then(() => {
      done();
    });
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  it('Must fail for missing required properties', async () => {
    const response = await handler({
      body: JSON.stringify({}),
    } as any);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toStrictEqual([
      'email should not be empty',
      'email must be an email',
      'password must be longer than or equal to 6 characters',
      'password should not be empty',
      'password must be a string',
      'name should not be empty',
      'name must be a string',
      'gender should not be empty',
      'gender must be one of the following values: MALE, FEMALE',
      'age must be a number conforming to the specified constraints',
      'age should not be empty',
    ]);
  });

  it('Must fail when email is duplicated', async () => {
    const user = {
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
    await UserModel.create(user);

    const response = await handler({
      body: JSON.stringify(user),
    } as any);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe(
      `user with email ${[user.email]} already existing`,
    );
  });

  it('Must succeed in creating new user', async () => {
    const user = {
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

    const response = await handler({
      body: JSON.stringify(user),
    } as any);
    expect(response.statusCode).toBe(200);
    const resultedUser = JSON.parse(response.body).user;
    expect(resultedUser.email).toBe(user.email);
    expect(resultedUser.name).toBe(user.name);
    expect(resultedUser.gender).toBe(user.gender);
    expect(resultedUser.age).toBe(user.age);
    expect(resultedUser.location).toStrictEqual(user.location);
  });

  afterAll(async () => {
    await MongoConnection.close();
  });
});
