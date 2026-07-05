import dns from 'dns';
import mongoose from 'mongoose';

// Node on Windows can fail mongodb+srv SRV lookups with the system DNS resolver.
dns.setServers(['8.8.8.8', '1.1.1.1']);

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
