import '@testing-library/jest-dom';

// Provide environment variables for tests to avoid configuration validation errors
process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
process.env.NEXT_PUBLIC_MESSAGE_API_URL = 'https://mock-message.example.com';
process.env.NEXT_PUBLIC_ORDER_API_URL = 'https://mock-order.example.com';

