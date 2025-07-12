import { useState } from "react";
import { useSearchParams } from "react-router";

export type BoardsSortOptions =
  | "createdAt"
  | "updatedAt"
  | "lastOpenedAt"
  | "name";

export type BoardsFilters = {
  sort: BoardsSortOptions;
  search: string;
};

export function useBoardsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState<BoardsSortOptions>(
    (searchParams.get("sort") as BoardsSortOptions) || "lastOpenedAt",
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");

  function setSortWithSearchParams(newSort: BoardsSortOptions) {
    setSort(newSort);
    searchParams.set("sort", newSort);
    setSearchParams(searchParams);
  }

  function setSearchWithSearchParams(newSearch: string) {
    setSearch(newSearch);
    searchParams.set("search", newSearch);
    setSearchParams(searchParams);
  }

  return { sort, setSortWithSearchParams, search, setSearchWithSearchParams };
}
