import { rqClient } from "@/shared/api/instance";
import type { PathParams, ROUTES } from "@/shared/model/routes";
import { useParams } from "react-router";

export default function BoardPage() {
  const boardQuery = rqClient.useQuery("get", "/boards");
  const params = useParams<PathParams[typeof ROUTES.BOARD]>();
  const board = boardQuery.data?.find((b) => b.id === params.boardId);
  return board && <div>BoardPage {board.name}</div>;
}
