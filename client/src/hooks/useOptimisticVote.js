import { useState } from 'react';
import api from '@/api/axiosInstance';
import { useAuth } from '@/context/AuthContext';

/**
 * Optimistic upvote toggle with instant UI feedback and rollback on failure.
 *
 * Unauthenticated clicks surface the auth gate instead of voting.
 *
 * @param request  the current feature request object
 * @param setRequest  state setter for that request (functional updates supported)
 */
export function useOptimisticVote(request, setRequest) {
  const { user, openAuthGate } = useAuth();
  const [pending, setPending] = useState(false);

  const hasVoted = Boolean(user && request?.upvotedBy?.includes(user.id));

  const toggle = async () => {
    if (!user) {
      openAuthGate();
      return { requiresAuth: true, voted: hasVoted };
    }
    if (!request || pending) return { voted: hasVoted };

    setPending(true);
    const prev = { ...request }; // snapshot for rollback

    // 1. Update the UI immediately.
    setRequest((current) => ({
      ...current,
      upvoteCount: current.upvoteCount + (hasVoted ? -1 : 1),
      upvotedBy: hasVoted
        ? current.upvotedBy.filter((id) => id !== user.id)
        : [...current.upvotedBy, user.id],
    }));

    // 2. Confirm with the server; roll back on failure.
    try {
      const { data } = await api.post(`/requests/${request.id}/upvote`);
      setRequest((current) => ({
        ...current,
        upvoteCount: data.item.upvoteCount,
        upvotedBy: data.item.upvotedBy,
      }));
      return { voted: data.upvoted, previousVoted: hasVoted };
    } catch (err) {
      setRequest(prev); // instant rollback
      return { error: err, voted: hasVoted, previousVoted: hasVoted };
    } finally {
      setPending(false);
    }
  };

  return { toggle, hasVoted, pending };
}