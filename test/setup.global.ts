import { GenericContainer } from 'testcontainers';
export default async () => {
  const mongoDb = await new GenericContainer('mongo:5.0.11')
    .withExposedPorts(27017)
    .withEnv('MONGO_INITDB_DATABASE', 'test-db')
    .withEnv('MONGO_INITDB_ROOT_USERNAME', 'root')
    .withEnv('MONGO_INITDB_ROOT_PASSWORD', 'whatever')
    .start();

  process.env.DB = `mongodb://root:whatever@${mongoDb.getHost()}:${mongoDb.getMappedPort(
    27017,
  )}`;

  (global as any).__MONGO__ = mongoDb;
};
