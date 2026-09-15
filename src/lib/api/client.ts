import createClient from 'openapi-fetch';
import type { paths } from './generated';

export const apiClient = createClient<paths>({
  baseUrl: typeof window !== 'undefined' ? '/api/proxy' : (process.env.CORE_API_URL || 'http://localhost:3000'),
});
