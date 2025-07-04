import { rqClient } from "@/shared/api/instance";
import { ROUTES, type PathParams } from "@/shared/model/routes";
import { useParams } from "react-router";

export default function BoardPage() {
  const { boardId } = useParams<PathParams[typeof ROUTES.BOARD]>();
  const boardQuery = rqClient.useQuery("get", "/boards/{boardId}", {
    params: {
      path: { boardId: boardId ?? "" },
    },
  });
  const board = boardQuery.data;
  console.log(board);

  return board && <div>BoardPage {board.name}</div>;
}
