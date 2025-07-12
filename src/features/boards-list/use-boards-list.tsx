import { rqClient } from "@/shared/api/instance";
import { keepPreviousData } from "@tanstack/react-query";
import { useCallback, type RefCallback } from "react";

type UseBoardsListParams = {
  limit?: number;
  sort?: "createdAt" | "updatedAt" | "lastOpenedAt" | "name";
  search?: string;
  isFavorite?: boolean;
};

export function useBoardsList({
  limit = 12,
  sort,
  search,
  isFavorite,
}: UseBoardsListParams) {
  const { fetchNextPage, data, isFetchingNextPage, isPending, hasNextPage } =
    rqClient.useInfiniteQuery(
      "get",
      "/boards",
      {
        params: {
          query: {
            limit,
            sort,
            search,
            isFavorite,
          },
        },
      },
      {
        initialPageParam: 1,
        pageParamName: "page",
        getNextPageParam: (
          lastPage: { totalPages: number },
          _: unknown,
          lastPageParam: number,
        ) => {
          return lastPageParam < lastPage.totalPages
            ? lastPageParam + 1
            : undefined;
        },
        placeholderData: keepPreviousData,
      },
    );

  const cursorRef: RefCallback<HTMLDivElement> = useCallback(
    (el) => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        {
          threshold: 0.5,
        },
      );

      if (el) {
        observer.observe(el);

        return () => {
          observer.disconnect();
        };
      }
    },
    [fetchNextPage, isFetchingNextPage],
  );

  const boards = data?.pages.flatMap((page) => page.list) ?? [];

  return { boards, cursorRef, isFetchingNextPage, isPending, hasNextPage };
}
