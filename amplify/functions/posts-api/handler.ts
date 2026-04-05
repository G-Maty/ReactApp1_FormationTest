import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.POSTS_TABLE_NAME ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
};

const response = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, resource, pathParameters, requestContext } = event;
  const claims = (requestContext.authorizer?.claims ?? {}) as Record<string, string>;
  const sub = claims['sub'] ?? '';
  const groupsClaim = claims['cognito:groups'] ?? '';
  const groups = groupsClaim ? groupsClaim.split(',') : [];

  try {
    // POST /posts - Create a post (Admins only)
    if (httpMethod === 'POST' && resource === '/posts') {
      if (!groups.includes('Admins')) {
        return response(403, { message: 'Forbidden: Admins group required' });
      }
      const body = JSON.parse(event.body ?? '{}') as { title?: string; text?: string };
      if (!body.title || !body.text) {
        return response(400, { message: 'title and text are required' });
      }
      const postId = uuidv4();
      const createdAt = new Date().toISOString();
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { postId, title: body.title, text: body.text, createdAt, authorSub: sub, pk: 'POST' },
      }));
      return response(201, { postId });
    }

    // GET /posts - List own posts
    if (httpMethod === 'GET' && resource === '/posts') {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'createdAt-index',
        KeyConditionExpression: 'pk = :pk',
        FilterExpression: 'authorSub = :sub',
        ExpressionAttributeValues: { ':pk': 'POST', ':sub': sub },
        ScanIndexForward: false,
      }));
      return response(200, result.Items ?? []);
    }

    // DELETE /posts/{postId}
    if (httpMethod === 'DELETE' && resource === '/posts/{postId}') {
      if (!groups.includes('Admins')) {
        return response(403, { message: 'Forbidden: Admins group required' });
      }
      const postId = pathParameters?.postId;
      if (!postId) return response(400, { message: 'Missing postId' });

      const existing = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { postId },
      }));
      if (!existing.Item) return response(404, { message: 'Post not found' });
      if (existing.Item['authorSub'] !== sub) {
        return response(403, { message: 'Forbidden: not the author' });
      }
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { postId },
      }));
      return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    return response(404, { message: 'Not found' });
  } catch (err) {
    console.error('Handler error:', err);
    return response(500, { message: 'Internal server error' });
  }
};
