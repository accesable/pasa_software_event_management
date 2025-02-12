// src\components\oauth2-pkce.ts
import * as CryptoJS from 'crypto-js';

export function generateCodeVerifier(): string {
  const randomBytes = CryptoJS.lib.WordArray.random(32);
  return CryptoJS.enc.Base64url.stringify(randomBytes);
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  return base64urlencode(digest);
}

function base64urlencode(arrayBuffer: ArrayBuffer): string {
  const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}