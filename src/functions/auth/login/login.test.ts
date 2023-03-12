import { MongoConnection } from '../../../shared/mongo-connection';
import UserModel from '../../../models/user.model';
process.env.PRIVATE_KEY = 'secret';
import { handler } from './handler';

process.env.PRIVATE_KEY = 'secret';

describe('Login', () => {
  beforeAll((done) => {
    MongoConnection.init().then(() => {
      done();
    });
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  it('Must login successfully', async () => {
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
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    } as any);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).token).toBeDefined();
  });

  it('Must return unauthorized when password is incorrect', async () => {
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
      body: JSON.stringify({
        email: user.email,
        password: '123457',
      }),
    } as any);

    expect(response.statusCode).toBe(401);
  });

  it('Must return unauthorized when email is incorrect', async () => {
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
      body: JSON.stringify({
        email: 'user@gmail.com',
        password: '123456',
      }),
    } as any);

    expect(response.statusCode).toBe(401);
  });

  afterAll(async () => {
    await MongoConnection.close();
  });
});
