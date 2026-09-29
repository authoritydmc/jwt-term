export interface JWTHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

export interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

export interface DecodedJWT {
  raw: string;
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  rawSignature: string;
  isExpired: boolean;
  isValidStructure: boolean;
  expiresInSeconds?: number;
}

export interface VerificationResult {
  valid: boolean;
  algorithm: string;
  error?: string;
}

export interface InspectOptions {
  secret?: string;
  publicKey?: string;
  claim?: string;
  json?: boolean;
  color?: boolean;
}
