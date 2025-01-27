import { Product } from "@/types/Types";

export function getBuildTitle(productId: number, fileVersion: string, products: Product[], buildType: number) {
    
    const productName = products.find(product => product.id === productId)?.name;
    const version = buildType === 1 ? fileVersion : products.find(product => product.id === productId)?.version;

    const title = buildType === 1 
        ? `${productName} ${version}` 
        : `Документация ${productName} ${version}`;

    return title;
};