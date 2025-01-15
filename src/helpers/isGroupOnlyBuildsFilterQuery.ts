const FILTER_QUERY_PARAMETER = "showgroupedonly";

export const isGroupOnlyBuildsFilterQuery = () => {
    const searchParams = new URLSearchParams(window.location.search);

    return searchParams.has(FILTER_QUERY_PARAMETER);
};