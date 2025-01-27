import { PATHNAME_PRODUCT_ABBREVIATE, PRODUCT_VERSIONS } from "@/helpers/constants";

export const getProductVersionFromPathname = () => {
  const paths = location.pathname.split("/");
  const pathWithVersion = paths.find(path => path.includes(PATHNAME_PRODUCT_ABBREVIATE));

  if (!pathWithVersion) return null;

  return PRODUCT_VERSIONS[pathWithVersion] ?? null;
};
