export default async () => {
  if ((global as any).__MONGO__) {
    await (global as any).__MONGO__.stop();
  }
};
