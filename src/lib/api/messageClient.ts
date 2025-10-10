import { apiRequest } from './client';
import { API_CONFIG } from '@/config/api';

class MessageClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  async getAttachmentUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const response = await apiRequest<{ url: string }>(
        `${this.baseUrl}/attachments/presigned-url`,
        {
          method: 'POST',
          body: JSON.stringify({ s3Key, expiresIn })
        }
      );
      return response.url;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      throw error;
    }
  }
}

export const messageApi = new MessageClient(API_CONFIG.MESSAGE_API_URL);
export default messageApi;
