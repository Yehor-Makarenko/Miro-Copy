import { rqClient } from "@/shared/api/instance";
import type { ApiSchemas } from "@/shared/api/schema";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type BoardsData = {
  pages: {
    list: ApiSchemas["Board"][];
  }[];
};

let lastToggledBoardId: string | null = null;

export default function useToggleFavoriteBoard() {
  const queryClient = useQueryClient();

  const [toggledBoards, setToggledBoards] = useState<string[]>([]);

  const toggleBoardFavorite = (boardId: string) => {
    queryClient.setQueriesData(
      rqClient.queryOptions("get", "/boards"),
      (oldData: BoardsData): BoardsData => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            list: page.list.map((board) => {
              return board.id === boardId
                ? { ...board, isFavorite: !board.isFavorite }
                : board;
            }),
          })),
        };
      },
    );
  };

  const toggleFavoriteMutation = rqClient.useMutation(
    "patch",
    "/boards/{boardId}/favorite",
    {
      onMutate: ({
        params: {
          path: { boardId },
        },
      }) => {
        lastToggledBoardId = boardId;
        setToggledBoards((toggledBoards) => [...toggledBoards, boardId]);
        queryClient.cancelQueries(rqClient.queryOptions("get", "/boards"));
        toggleBoardFavorite(boardId);
      },
      onSettled: async (
        _,
        __,
        {
          params: {
            path: { boardId },
          },
        },
      ) => {
        setToggledBoards((toggledBoards) =>
          toggledBoards.filter((id) => id !== boardId),
        );
        if (lastToggledBoardId !== boardId) {
          return;
        }
        return await queryClient.invalidateQueries(
          rqClient.queryOptions("get", "/boards"),
        );
      },
    },
  );

  return {
    toggleFavorite: (boardId: string, isFavorite: boolean) =>
      toggleFavoriteMutation.mutate({
        params: { path: { boardId } },
        body: {
          isFavorite,
        },
      }),
    getIsPending: (boardId: string) =>
      toggleFavoriteMutation.isPending && toggledBoards.includes(boardId),
  };
}
