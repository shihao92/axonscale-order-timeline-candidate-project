import React, { useState, useEffect } from 'react';
import { messageApi } from '@/lib/api/messageClient';

interface PresignedImageProps {
  s3Url: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const extractS3Key = (s3Url: string): string | null => {
  try {
    const bucketName = 'axonscale-attachments-messagestack';
    if (s3Url.includes(`${bucketName}.s3.amazonaws.com/`)) {
      return s3Url.split(`${bucketName}.s3.amazonaws.com/`)[1];
    }
    return null;
  } catch (error) {
    console.error('Error extracting S3 key:', error);
    return null;
  }
};

const presignedUrlCache = new Map<string, string>();

const getPresignedUrl = async (s3Url: string): Promise<string> => {
  if (presignedUrlCache.has(s3Url)) {
    return presignedUrlCache.get(s3Url)!;
  }

  const s3Key = extractS3Key(s3Url);
  if (!s3Key) {
    console.warn('Could not extract S3 key from URL:', s3Url);
    return s3Url;
  }

  try {
    const presignedUrl = await messageApi.getAttachmentUrl(s3Key, 3600);
    presignedUrlCache.set(s3Url, presignedUrl);
    return presignedUrl;
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    return s3Url;
  }
};

export const PresignedImage: React.FC<PresignedImageProps> = ({
  s3Url,
  alt,
  className,
  onClick,
  onError
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPresignedUrl = async () => {
      setLoading(true);
      try {
        const presignedUrl = await getPresignedUrl(s3Url);
        setImageUrl(presignedUrl);
      } catch (error) {
        console.error('Failed to load presigned URL:', error);
        setImageUrl('/placeholder-product.svg');
      } finally {
        setLoading(false);
      }
    };

    loadPresignedUrl();
  }, [s3Url]);

  if (loading) {
    return <div className={`bg-gray-200 animate-pulse ${className}`}></div>;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/placeholder-product.svg';
        onError?.(e);
      }}
    />
  );
};

export { getPresignedUrl, extractS3Key };
export default PresignedImage;
