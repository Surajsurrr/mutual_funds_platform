import { useState, useEffect, useCallback } from 'react';
import { readClient, writeClient } from './axiosClients';

// ─── Generic fetcher hook ────────────────────────────────────────────────────
export function useFetch(client, path, { deps = [], skip = false } = {}) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError]   = useState(null);

  const refetch = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);
    try {
      const res = await client.get(path);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, skip, ...deps]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

// ─── Market / public reads ────────────────────────────────────────────────────
export const useAmcs    = ()          => useFetch(readClient, '/amcs');
export const useSchemes = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== 'All'))
  ).toString();
  return useFetch(readClient, `/schemes${qs ? '?' + qs : ''}`);
};
export const useScheme      = (id)        => useFetch(readClient, `/schemes/${id}`,         { skip: !id });
export const useNavHistory  = (id, days=30) => useFetch(readClient, `/schemes/${id}/nav-history?days=${days}`, { skip: !id });

// ─── Per-user reads ───────────────────────────────────────────────────────────
export const usePortfolio    = () => useFetch(readClient, '/portfolio');
export const useTransactions = (type='', limit=100) =>
  useFetch(readClient, `/transactions?type=${type}&limit=${limit}`);
export const useOrders = () => useFetch(readClient, '/orders');
export const useOrderByRef = (clientRef) =>
  useFetch(readClient, `/orders/${clientRef}`, { skip: !clientRef });

// ─── Admin reads ──────────────────────────────────────────────────────────────
export const useAdminStats    = () => useFetch(readClient, '/admin/stats');
export const useAdminUsers    = () => useFetch(readClient, '/admin/users');
export const useAdminAmcs     = () => useFetch(readClient, '/admin/amcs');
export const useAdminPending  = () => useFetch(readClient, '/admin/amcs/pending');
export const useAdminAnalytics = () => useFetch(readClient, '/admin/analytics');
export const useAdminDLQ      = () => useFetch(readClient, '/admin/dlq');
export const useAdminSystem   = () => useFetch(readClient, '/admin/system');

// ─── AMC reads ────────────────────────────────────────────────────────────────
export const useAmcStats     = () => useFetch(readClient, '/amc/stats');
export const useAmcSchemes   = () => useFetch(readClient, '/amc/schemes');
export const useAmcInvestors = () => useFetch(readClient, '/amc/investors');

// ─── CB reads ─────────────────────────────────────────────────────────────────
export const useCbStats        = () => useFetch(readClient, '/cb/stats');
export const useCbClients      = () => useFetch(readClient, '/cb/clients');
export const useCbTransactions = () => useFetch(readClient, '/cb/transactions');
