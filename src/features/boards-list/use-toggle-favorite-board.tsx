import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function useToggleFavoriteBoard() {
  const queryClient = useQueryClient();

  const [toggledBoards, setToggledBoards] = useState<Record<string, boolean>>(
    {},
  );

  // const toggleBoardFavorite = (boardId: string) => {
  //   queryClient.setQueriesData(
  //     rqClient.queryOptions("get", "/boards"),
  //     (
  //       oldData: InfiniteData<ApiSchemas["BoardsList"]>,
  //     ): InfiniteData<ApiSchemas["BoardsList"]> => {
  //       if (!oldData) {
  //         return oldData;
  //       }

  //       return {
  //         ...oldData,
  //         pages: oldData.pages.map((page) => ({
  //           ...page,
  //           list: page.list.map((board) => {
  //             return board.id === boardId
  //               ? { ...board, isFavorite: !board.isFavorite }
  //               : board;
  //           }),
  //         })),
  //       };
  //     },
  //   );
  // };

  const toggleFavoriteMutation = rqClient.useMutation(
    "patch",
    "/boards/{boardId}/favorite",
    {
      onMutate: ({ params, body }) => {
        queryClient.cancelQueries(rqClient.queryOptions("get", "/boards"));

        setToggledBoards((toggledBoards) => ({
          ...toggledBoards,
          [params.path.boardId]: body.isFavorite,
        }));
      },
      onSettled: async (_, __, { params }) => {
        await queryClient.invalidateQueries(
          rqClient.queryOptions("get", "/boards"),
        );
        setToggledBoards((toggledBoards) => {
          const newToggledBoards = { ...toggledBoards };
          delete newToggledBoards[params.path.boardId];
          return newToggledBoards;
        });
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
      toggleFavoriteMutation.isPending && boardId in toggledBoards,
    getOptimisticFavorite: (board: { id: string; isFavorite: boolean }) =>
      toggledBoards[board.id] ?? board.isFavorite,
  };
}
