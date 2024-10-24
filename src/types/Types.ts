export type Item = {
  id: number,
  productId: number,
  fileVersion: string,
  type: number,
  changes: {
    title: string,
    description: string,
    fileVersion: string,
    type: number,
    detailed?: string
  }[],
  metadata: {
    publishDate: string,
    isPublic: boolean
  }
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