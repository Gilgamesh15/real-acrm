import { useQuery } from "@tanstack/react-query";

export function useViewerCounts(pieceIds: string[]) {
  const key = pieceIds.slice().sort().join(",");

  const { data } = useQuery({
    queryKey: ["viewer-counts", key],
    queryFn: async () => {
      const res = await fetch(
        `/api/viewers?pieceIds=${encodeURIComponent(pieceIds.join(","))}`
      );
      if (!res.ok) return {};
      const json = await res.json();
      return (json.counts ?? {}) as Record<string, number>;
    },
    enabled: pieceIds.length > 0,
    refetchInterval: 10_000,
    staleTime: 5_000,
  });

  return data;
}
