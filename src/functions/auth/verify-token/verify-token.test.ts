import { MongoConnection } from '../../../shared/mongo-connection';
import UserModel from '../../../models/user.model';
import jwt from 'jsonwebtoken';
import { handler } from './handler';

process.env.PRIVATE_KEY = 'secret';

describe('Verify token', () => {
  beforeAll((done) => {
    MongoConnection.init().then(() => {
      done();
    });
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  it('Must succeed when sending valid token inside the header', async () => {
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
    const createdUser = await UserModel.create(user);
    const token = jwt.sign(createdUser.toJSON(), 'secret');
    const output = await handler({
      headers: {
        Authorization: token,
      },
    } as any);
    expect(output.principalId).toBe(createdUser._id.toString());
  });

  it('Must fail when sending invalid token inside the header', async () => {
    const output = await handler({
      headers: {
        Authorization: 'INVaLID TOKEN',
      },
    } as any);
    expect(output.principalId).toBe(null);
  });

  afterAll(async () => {
    await MongoConnection.close();
  });
});
