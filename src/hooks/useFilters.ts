import { ChangeEvent, useEffect, useState } from "react";
import { Build, Filter, Filters, Group, GroupedBuilds, Product, ProductsMap } from "@/types/Types";
import { getInitialFilters } from "@/helpers/getInitialFIlters";
import { fetchBuilds } from "@/helpers/api";
import { filterSearchResults } from "@/helpers/filterSearchResults";
import { CHANGE_DOCUMENTATION_TYPE, MAX_BUILDS_COUNT } from "@/helpers/constants";
import { groupBuildsByDate } from "@/helpers/groupBuildsByDate";

let ALL_BUILDS_CACHE: Build[] = [];

export function useFilters(products: Product[], builds: Build[], groups: Group[], productsMap: ProductsMap | null) {
    const [filters, setFilters] = useState<Filters>({} as Filters);
    const [groupedBuilds, setGroupedBuilds] = useState<GroupedBuilds[]>([]); 

    useEffect(() => {
        if (!products.length) return;

        const initialFilters = getInitialFilters(products);
        setFilters(initialFilters);
    }, [products]);

    useEffect(() => {
        if (!builds.length || !productsMap || !groups.length) return;

        filterBuilds(filters, builds, productsMap)
            .then(filterBuilds => {
                const groupedBuilds = groupBuildsByDate(filterBuilds, groups);
                setGroupedBuilds(groupedBuilds);
            });
    }, [builds, filters, productsMap, groups]);

    const handleChangeFilter = (type: Filter["type"]) => (event: ChangeEvent<HTMLInputElement>) => {
        const filterName = event.target.name;

        setFilters(prev => {
            const newState = { ...prev };

            if (type === "products") {
                newState[type] = newState[type].map(filter => filter.name === filterName ? { ...filter, value: !filter.value} : filter);
            }

            if (type === "versions") {
                newState[type].filters = newState[type].filters.map(filter => filter.name === filterName ? { ...filter, value: !filter.value} : filter);
            }

            if (type === "exclusive") {
                const currentFilter = newState.exclusive.find(filter => filter.name === filterName);

                newState[type] = newState[type].map(filter => {
                    if (filter.name === filterName) {
                        return { ...filter, value: !filter.value };
                    }

                    return { ...filter, value: currentFilter?.value ? filter.value : false };
                });
            }

            return newState;
        });
    };
    
    function handleChangeSearch(value: string) {
        setFilters(prev => {
            const newState = { ...prev };

            newState.search.value = value;

            return newState;
        });
    }

    return { filters, groupedBuilds, handleChangeFilter, handleChangeSearch };
};

export async function filterBuilds(filters: Filters, builds: Build[], productsMap: ProductsMap) {
    const { exclusive, products, search, versions } = filters;

    const activeFilters = [ ...versions.filters, ...products, ...exclusive].filter(filter => !!filter.value);

    let filterBuilds: Build[] = [];
    const hasDocumentationFilter = activeFilters.some(filter => filter.name === "documentation");

    if (search.value) {
        try {
            if (!ALL_BUILDS_CACHE.length) {
                ALL_BUILDS_CACHE = await fetchBuilds(0, MAX_BUILDS_COUNT);
            } 

            filterBuilds = filterSearchResults([...ALL_BUILDS_CACHE], search.value as string);
        } catch(error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
    
            console.error("Ошибка получения данных с сервера", error);
        }
    } else {
        filterBuilds = builds;
    }

    return filterBuilds.filter(build => {
        const hasDocumentation = build.changes.some(change => change.type === CHANGE_DOCUMENTATION_TYPE);

        const matchesFilters = activeFilters.every(filter => {
            if (filter.type === "products") return productsMap.products[filter.name].includes(build.productId);
            if (filter.type === "versions") return productsMap.versions[filter.name].includes(build.productId);
            if (filter.name === "group") return !!build.groupId;
            if (filter.name === "documentation") return hasDocumentation;
        });

        if (!hasDocumentationFilter) return matchesFilters && !hasDocumentation;

        return matchesFilters;
    });
};