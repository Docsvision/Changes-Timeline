export type BuildMetadata = {
  publishDate: string;
  isPublic: boolean;
}

export type BuildChange = {
  title: string;
  description: string;
  fileVersion: string;
  type: number;
  detailed?: string;
}

export type Build = {
  id: number;
  productId: number;
  fileVersion: string;
  type: number;
  changes: BuildChange[];
  metadata: BuildMetadata;
  groupId: number;
}

export type Product = {
  id: number;
  name: string;
  version: string;
  alias: string;
}

export type ProductsMap = {
  products: Record<string, number[]>;
  versions: Record<string, number[]>;
}

export type Group = {
  id: number;
  title: string;
  description?: string;
  builds?: Build[];
  publishDate?: string;
}

export type MappedBuildChanges = Record<number, BuildChange[]>;

export type GroupedBuild = Omit<Build, "changes"> & {
  changes: MappedBuildChanges;
}

export type GroupedBuilds = {
  date: string;
  builds: GroupedBuild[];
  groupId: number;
  groupInfo?: Group;
}

export type FilterType = "search" | "exclusive" | "versions" | "products";

export type Filter = {
  id: number;
  name: string;
  displayName: string;
  type: FilterType;
  value: boolean;
}

export type SearchFilter = Omit<Filter, "value"> & {
  value: string;
}

export type Filters = {
  search: SearchFilter;
  exclusive: Filter[];
  versions: {
    filters: Filter[];
    shouldRender: boolean;
  }
  products: Filter[];
}