import mongoose, { Mongoose } from 'mongoose';

export class MongoConnection {
  static client: Mongoose;

  static async init() {
    if (!this.client) {
      this.client = await mongoose.connect(process.env.DB!);
    }
    return this.client;
  }

  static async close() {
    await this.client.disconnect();
  }
}
