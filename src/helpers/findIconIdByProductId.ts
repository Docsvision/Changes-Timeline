import { productIconMap } from "@/helpers/icons";
import { Product } from "@/types/Types";

export function findIconIdByProductId(productId: number, products: Product[]) {
    const currentProduct = products.find(product => product.id === productId);

    if (!currentProduct) return;

    return productIconMap[currentProduct.name];
};