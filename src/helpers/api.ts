import { API } from "@/helpers/constants";
import { Build, Group, Product } from "@/types/Types";

export async function fetchBuilds(offset: number, limit: number): Promise<Build[]> {
    const response = await fetch(API.BUILDS(offset, limit));
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || response.statusText);

    return data;
  }

  export async function fetchProducts(): Promise<Product[]> {
    const response = await fetch(API.PRODUCTS);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || response.statusText);

    return data;
  }

  export async function fetchGroups(): Promise<Group[]> {
    const response = await fetch(API.GROUPS);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || response.statusText);

    return data;
  }