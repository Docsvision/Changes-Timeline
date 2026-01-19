export const API = {
    PRODUCTS: "https://help.docsvision.com/api/products",
    GROUPS: "https://help.docsvision.com/api/groups",
    BUILDS: (offset: number, limit: number) => `https://help.docsvision.com/api/views/timeline?offset=${offset}&limit=${limit}`,
}

export const GROUP_ID_SEARCH_QUERY = "groupId";

export const PRODUCT_VERSIONS: Record<string, string> = {
    "dv5": "5.5",
    "dv6": "6",
};

export const PATHNAME_PRODUCT_ABBREVIATE  = "dv";

export const INITIAL_LIMIT = 100;

export const PRODUCTS_SORT_ORDER = [7, 1, 6, 8, 20, 28, 5, 3, 12, 19, 22, 32, 2, 27, 29, 15];

export const CHANGE_DOCUMENTATION_TYPE = 6;

export const SEARCH_DEBOUNCE_DELAY = 1000;

export const GROUP_ICON_ID = "icon-nav-component-group";

export const CHANGE_NAME_BY_TYPE: Record<number, string> = {
    1: "Исправленные ошибки",
    2: "Оптимизации",
    3: "Функциональные изменения",
    4: "Изменения в библиотеках элементов управления",
    5: "Изменения в API",
    6: "Изменения в документации",
    7: "Безопасность"
};

export const MAX_BUILDS_COUNT = 1000;

