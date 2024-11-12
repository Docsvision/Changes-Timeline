export const PRODUCT_VERSIONS: Record<string, string> = {
  'dv5': '5.5',
  'dv6': '6.1',
};

const PATHNAME_PRODUCT_ABBREVIATE  = 'dv';

export const getProductVersionFromPathname = () => {
  const paths = location.pathname.split('/');
  const pathWithVersion = paths.find(path => path.includes(PATHNAME_PRODUCT_ABBREVIATE));

  if (!pathWithVersion) return null;

  return PRODUCT_VERSIONS[pathWithVersion] ?? null;
}
