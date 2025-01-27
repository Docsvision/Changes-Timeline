import { GROUP_ID_SEARCH_QUERY } from "@/helpers/constants";

export function getGroupIdFromQuery(): number | null {
    const searchParams = new URLSearchParams(window.location.search);

    if (!searchParams.has(GROUP_ID_SEARCH_QUERY)) return null;

    const groupId = searchParams.get(GROUP_ID_SEARCH_QUERY)!;
    
    return typeof +groupId === "number" ? +groupId : null;
};