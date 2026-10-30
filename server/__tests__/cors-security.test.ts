import { describe, it, expect } from 'vitest';

// Test CORS resolution function under different simulated environments
function testOriginAllowed(clientUrlSetting: string, origin: string | undefined): boolean {
  if (!origin) return true;
  if (!clientUrlSetting) return false;
  if (clientUrlSetting === '*') return true;

  const allowedList = clientUrlSetting.split(',').map(s => s.trim().toLowerCase());
  const originLower = origin.toLowerCase();

  for (const allowed of allowedList) {
    if (allowed === originLower) {
      return true;
    }
    if (allowed.startsWith('https://*.') || allowed.startsWith('http://*.') || allowed.startsWith('*.')) {
      const suffix = allowed.replace(/^(https?:\/\/)?\*\./, '.');
      const originHost = originLower.replace(/^https?:\/\//, '');
      if (originHost.endsWith(suffix)) {
        return true;
      }
    }
  }

  return false;
}

describe('Production CORS Security Policy', () => {
  it('allows exact configured production domain', () => {
    const config = 'https://uno-game.pages.dev';
    expect(testOriginAllowed(config, 'https://uno-game.pages.dev')).toBe(true);
  });

  it('blocks unrelated .pages.dev domain when specific domain is configured', () => {
    const config = 'https://uno-game.pages.dev';
    expect(testOriginAllowed(config, 'https://malicious-uno.pages.dev')).toBe(false);
    expect(testOriginAllowed(config, 'https://random.pages.dev')).toBe(false);
  });

  it('allows multiple comma-separated origins', () => {
    const config = 'https://uno-game.pages.dev,https://custom-uno.com,http://localhost:3000';
    expect(testOriginAllowed(config, 'https://uno-game.pages.dev')).toBe(true);
    expect(testOriginAllowed(config, 'https://custom-uno.com')).toBe(true);
    expect(testOriginAllowed(config, 'http://localhost:3000')).toBe(true);
    expect(testOriginAllowed(config, 'https://attacker.com')).toBe(false);
  });

  it('allows wildcards ONLY when explicitly configured with *.', () => {
    const wildcardConfig = 'https://*.pages.dev';
    expect(testOriginAllowed(wildcardConfig, 'https://my-uno.pages.dev')).toBe(true);
    expect(testOriginAllowed(wildcardConfig, 'https://feature-preview.pages.dev')).toBe(true);
    expect(testOriginAllowed(wildcardConfig, 'https://external-site.com')).toBe(false);
  });

  it('blocks all external origins if CLIENT_URL is empty in production', () => {
    const emptyConfig = '';
    expect(testOriginAllowed(emptyConfig, 'https://anything.com')).toBe(false);
    // Server-to-server / healthcheck with no origin header is permitted
    expect(testOriginAllowed(emptyConfig, undefined)).toBe(true);
  });
});
