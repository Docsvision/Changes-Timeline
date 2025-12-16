import { GROUP_ID_SEARCH_QUERY } from "@/helpers/constants";

export function getLinkWithGroupId(groupId: string) {
    const url = new URL(location.href)
    url.searchParams.set(GROUP_ID_SEARCH_QUERY, groupId);

    return url.toString();
}