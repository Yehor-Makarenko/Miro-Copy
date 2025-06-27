import { CONFIG } from "@/shared/model/config";
import { ROUTES, typedHref } from "@/shared/model/routes";
import { Link } from "react-router";

export default function BoardList() {
  console.log(CONFIG.API_BASE_URL);
  return (
    <div>
      <Link to={typedHref(ROUTES.BOARD, { boardId: "1" })}>Board 1</Link>
    </div>
  );
}
