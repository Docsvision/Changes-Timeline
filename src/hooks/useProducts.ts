import { Dispatch, useEffect, useState } from "react";
import { Product, ProductsMap } from "@/types/Types";
import { fetchProducts } from "@/helpers/api";

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [productsMap, setProductsMap] = useState<ProductsMap | null>(null);

    useEffect(() => {
        getProducts(setProducts);
    }, [])

    useEffect(() => {
        if (!products.length) return;

        const productsMap = getProductsMap(products);
        setProductsMap(productsMap);
    }, [products])

    return { products, productsMap };
};

export async function getProducts(set: Dispatch<React.SetStateAction<Product[]>>) {
    try {
        const products = await fetchProducts();
        set(products);
    } catch(error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
};

export function getProductsMap(products: Product[]) {
    const productsMap: ProductsMap = {
        products: {},
        versions: {}
    };

    for (const product of products) {
        const {id, alias, version} = product;
        const productVersion = version.startsWith("5") ? "5.5" : version;

        if (!productsMap.products[alias]) productsMap.products[alias] = [];
        productsMap.products[alias].push(id);

        if (!productsMap.versions[productVersion]) productsMap.versions[productVersion] = [];
        productsMap.versions[productVersion].push(id);
    }

    return productsMap;
}