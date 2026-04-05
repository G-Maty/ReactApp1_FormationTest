declare module '../amplify_outputs.json' {
  const value: {
    version: string;
    auth?: {
      aws_region: string;
      user_pool_id: string;
      user_pool_client_id: string;
      identity_pool_id?: string;
      mfa_methods?: string[];
      standard_required_attributes?: string[];
      username_attributes?: string[];
      user_verification_types?: string[];
      mfa_configuration?: string;
      password_policy?: {
        min_length?: number;
        require_lowercase?: boolean;
        require_numbers?: boolean;
        require_symbols?: boolean;
        require_uppercase?: boolean;
      };
      unauthenticated_identities_enabled?: boolean;
    };
    custom?: {
      apiUrl?: string;
      userPoolId?: string;
      userPoolClientId?: string;
      [key: string]: unknown;
    };
  };
  export default value;
}
