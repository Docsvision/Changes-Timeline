export type Item = {
  id: number;
  productId: number;
  fileVersion: string;
  type: number;
  changes: {
    title: string;
    description: string;
    fileVersion: string;
    type: number;
    detailed?: string;
  }[],
  metadata: {
    publishDate: string;
    isPublic: boolean;
  }
  groupId: number;
}

export type Product = {
  id: number;
  name: string;
  version: string;
  alias: string;
}

export type ProductFilterMap = {
  [key: string]: number[];
};

export type Group = {
  id: number;
  title: string;
  description?: string;
  builds?: Item[];
  publishDate?: string;
}