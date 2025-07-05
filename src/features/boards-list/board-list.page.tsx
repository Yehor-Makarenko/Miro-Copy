import { rqClient } from "@/shared/api/instance";
import { ROUTES, typedHref } from "@/shared/model/routes";
import { Button } from "@/shared/ui/kit/button";
import { Card, CardFooter, CardHeader } from "@/shared/ui/kit/card";
import { Input } from "@/shared/ui/kit/input";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/shared/ui/kit/select";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useCallback, useState, type RefCallback } from "react";
import { Link, useSearchParams } from "react-router";

type SORT_VALUES = "createdAt" | "updatedAt" | "lastOpenedAt" | "name";

export default function BoardList() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState<SORT_VALUES>(
    (searchParams.get("sort") as SORT_VALUES) || "lastOpenedAt",
  );
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(
    searchParams.get("isFavorite") === "true" ? true : undefined,
  );

  const { data, fetchNextPage, hasNextPage, isFetching } =
    rqClient.useInfiniteQuery(
      "get",
      "/boards",
      {
        params: {
          query: {
            limit: 12,
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
          if (entries[0].isIntersecting && hasNextPage && !isFetching) {
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
    [fetchNextPage, hasNextPage, isFetching],
  );
  const createBoardMutation = rqClient.useMutation("post", "/boards", {
    onSettled: async () =>
      await queryClient.invalidateQueries(
        rqClient.queryOptions("get", "/boards"),
      ),
  });
  const deleteBoardMutation = rqClient.useMutation(
    "delete",
    "/boards/{boardId}",
    {
      onSettled: async () =>
        await queryClient.invalidateQueries(
          rqClient.queryOptions("get", "/boards"),
        ),
    },
  );

  const toggleFavoriteMutation = rqClient.useMutation(
    "patch",
    "/boards/{boardId}/favorite",
    {
      onMutate: ({
        params: {
          path: { boardId },
        },
      }) => {
        const board = data?.pages
          .find((page) => page.list.find((board) => board.id === boardId))
          ?.list.find((board) => board.id === boardId);
        if (board) {
          board.isFavorite = !board.isFavorite;
        }
      },
      onSettled: async () =>
        await queryClient.invalidateQueries(
          rqClient.queryOptions("get", "/boards"),
        ),
    },
  );

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    searchParams.set("search", newSearch);
    setSearchParams(searchParams);
  };

  const handleSortChange = (newSort: SORT_VALUES) => {
    setSort(newSort);
    searchParams.set("sort", newSort);
    setSearchParams(searchParams);
  };

  const handleIsFavoriteChange = (newIsFavorite: string) => {
    if (newIsFavorite === "favorite") {
      setIsFavorite(true);
      searchParams.set("isFavorite", "true");
      setSearchParams(searchParams);
    } else {
      setIsFavorite(undefined);
      searchParams.delete("isFavorite");
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Boards List</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3">
          <Input
            placeholder="Search boards..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full"
          />
          <Select
            value={isFavorite ? "favorite" : "all"}
            onValueChange={(value) => handleIsFavoriteChange(value)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Boards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All boards</SelectItem>
              <SelectItem value="favorite">Favorite only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={sort}
            onValueChange={(value) => handleSortChange(value as SORT_VALUES)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created at</SelectItem>
              <SelectItem value="updatedAt">Updated at</SelectItem>
              <SelectItem value="lastOpenedAt">Last opened at</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => createBoardMutation.mutate({})}>
            Create board
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.list.map((board) => (
              <Card key={board.id} className="rounded-2xl shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <Button
                      asChild
                      variant="link"
                      className="text-lg font-medium"
                    >
                      <Link to={typedHref(ROUTES.BOARD, { boardId: board.id })}>
                        {board.name}
                      </Link>
                    </Button>
                    <Button
                      variant={board.isFavorite ? "default" : "secondary"}
                      onClick={() =>
                        toggleFavoriteMutation.mutate({
                          params: { path: { boardId: board.id } },
                          body: { isFavorite: !board.isFavorite },
                        })
                      }
                    >
                      {board.isFavorite ? "★" : "☆"}
                    </Button>
                  </div>
                </CardHeader>
                <CardFooter className="justify-end">
                  <Button
                    variant="destructive"
                    disabled={deleteBoardMutation.isPending}
                    onClick={() =>
                      deleteBoardMutation.mutate({
                        params: {
                          path: {
                            boardId: board.id,
                          },
                        },
                      })
                    }
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div ref={cursorRef} className="h-10"></div>
    </div>
  );
}
