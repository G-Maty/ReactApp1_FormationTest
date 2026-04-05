#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const outputsPath = new URL('../amplify_outputs.json', import.meta.url).pathname;

// Read existing outputs
let outputs;
try {
  outputs = JSON.parse(readFileSync(outputsPath, 'utf8'));
} catch {
  outputs = { version: '1' };
}

const userPoolId = process.env.USER_POOL_ID ?? '';
const userPoolClientId = process.env.USER_POOL_CLIENT_ID ?? '';
const appId = process.env.AWS_APP_ID ?? '';
const branch = process.env.AWS_BRANCH ?? '';

// Fetch API URL from CloudFormation output
let apiUrl = '';
try {
  const stackName = `amplify-${appId}-${branch}-RestApiStack`;
  apiUrl = execSync(
    `aws cloudformation describe-stacks --stack-name "${stackName}" --query "Stacks[0].Outputs[?OutputKey=='AdminApiUrl'].OutputValue" --output text --region ap-northeast-1`,
    { encoding: 'utf8' }
  ).trim();
  console.log(`API URL fetched: ${apiUrl}`);
} catch (e) {
  console.warn('Could not fetch API URL from CloudFormation:', e.message);
}

// Inject auth section
outputs.auth = {
  aws_region: 'ap-northeast-1',
  user_pool_id: userPoolId,
  user_pool_client_id: userPoolClientId,
  identity_pool_id: '',
  mfa_methods: [],
  standard_required_attributes: ['email'],
  username_attributes: ['email'],
  user_verification_types: ['email'],
  mfa_configuration: 'NONE',
  password_policy: {
    min_length: 8,
    require_lowercase: true,
    require_numbers: true,
    require_symbols: true,
    require_uppercase: true,
  },
  unauthenticated_identities_enabled: false,
};

// Inject API URL
if (apiUrl) {
  outputs.custom = { ...(outputs.custom ?? {}), apiUrl };
}

writeFileSync(outputsPath, JSON.stringify(outputs, null, 2));
console.log('amplify_outputs.json patched successfully');
