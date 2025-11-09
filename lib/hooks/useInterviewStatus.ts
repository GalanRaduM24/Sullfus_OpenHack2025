/**
 * Hook to poll interview status and get results
 */

import { useState, useEffect, useCallback } from 'react';
import type { InterviewStatusResponse } from '@/lib/firebase/types';

interface UseInterviewStatusOptions {
  interviewId: string | null;
  enabled?: boolean;
  pollInterval?: number; // milliseconds
  onComplete?: (data: InterviewStatusResponse) => void;
  onError?: (error: Error) => void;
}

export function useInterviewStatus({
  interviewId,
  enabled = true,
  pollInterval = 3000, // Poll every 3 seconds
  onComplete,
  onError,
}: UseInterviewStatusOptions) {
  const [status, setStatus] = useState<InterviewStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!interviewId || !enabled) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/interviews/${interviewId}/status`);

      if (!response.ok) {
        throw new Error('Failed to fetch interview status');
      }

      const data: InterviewStatusResponse = await response.json();
      setStatus(data);

      // Call onComplete callback if interview is done
      if (data.status === 'done' && onComplete) {
        onComplete(data);
      }

      // Call onError callback if interview failed
      if (data.status === 'failed' && onError) {
        onError(new Error(data.error_message || 'Interview processing failed'));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [interviewId, enabled, onComplete, onError]);

  useEffect(() => {
    if (!interviewId || !enabled) return;

    // Fetch immediately
    fetchStatus();

    // Set up polling if status is processing
    const intervalId = setInterval(() => {
      if (status?.status === 'processing' || status?.status === 'started') {
        fetchStatus();
      }
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [interviewId, enabled, pollInterval, status?.status, fetchStatus]);

  const refetch = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refetch,
    isProcessing: status?.status === 'processing' || status?.status === 'started',
    isDone: status?.status === 'done',
    isFailed: status?.status === 'failed',
  };
}
