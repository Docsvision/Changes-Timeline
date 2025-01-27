import { PRODUCT_VERSIONS, PRODUCTS_SORT_ORDER } from "@/helpers/constants";
import { getProductVersionFromPathname } from "@/helpers/getProductVersionFromPathname";
import { Filter, Filters, Product, SearchFilter } from "@/types/Types";

export function getInitialFilters(products: Product[]): Filters {
    const searchFilter: SearchFilter = getSearchFilter();
    const exclusiveFilters = getExclusiveFilters();
    const productsFilters = getProductsFilters(products);
    const { shouldRenderVersions, versionsFilters } = getVersionsFilters();
    
    return {
        search: searchFilter,
        exclusive: exclusiveFilters,
        versions: {
            filters: versionsFilters,
            shouldRender: shouldRenderVersions
        },
        products: productsFilters
    };
};

function getProductsFilters(products: Product[]): Filter[] {
    return PRODUCTS_SORT_ORDER.flatMap(id => {
        const product = products.find(product => product.id === id);

        if (!product) return [];

        const productFilter: Filter = {
            id: product.id,
            name: product.alias,
            displayName: product.name,
            type: "products",
            value: false
        };

        return [productFilter];
    });
};


function getSearchFilter(): SearchFilter {
    return {
        id: 1,
        name: "search",
        displayName: "Поиск по изменениям",
        type: "search",
        value: ""
    }
};

function getVersionsFilters() {
    const isPredefinedVersion = getProductVersionFromPathname();

    const productVersions = Object.values(PRODUCT_VERSIONS);

    const versionsFilters: Filter[] = productVersions.map((version, index) => ({
        id: index + 1,
        name: version,
        displayName: version,
        type: "versions",
        value: isPredefinedVersion === version
    }));

    return { versionsFilters, shouldRenderVersions: !isPredefinedVersion };
};

function getExclusiveFilters(): Filter[] {
    return [
        {
            id: 1,
            name: "group",
            displayName: "Показывать только накопительные обновления",
            type: "exclusive",
            value: false,
        },
        {
            id: 2,
            name: "documentation",
            displayName: "Показывать изменения в документации",
            type: "exclusive",
            value: false,
        }
    ]
};
