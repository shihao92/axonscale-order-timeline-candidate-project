const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

const validateApiUrl = (url: string | undefined, name: string): string => {
  // If using mock data, return a placeholder URL
  if (USE_MOCK_DATA) {
    return 'https://mock-api.example.com';
  }

  if (!url) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return url;
};

export const API_CONFIG = {
  MESSAGE_API_URL: validateApiUrl(process.env.NEXT_PUBLIC_MESSAGE_API_URL, 'NEXT_PUBLIC_MESSAGE_API_URL'),
  ORDER_API_URL: validateApiUrl(process.env.NEXT_PUBLIC_ORDER_API_URL, 'NEXT_PUBLIC_ORDER_API_URL'),
} as const;

export type ApiConfig = typeof API_CONFIG;
