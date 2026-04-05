import { defineFunction } from '@aws-amplify/backend';

export const postsApiFunction = defineFunction({
  name: 'posts-api',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 30,
  memoryMB: 256,
});
