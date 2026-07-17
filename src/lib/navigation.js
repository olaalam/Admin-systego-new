export const navigateToListWithHighlight = (navigate, listPath, id) => {
  if (!listPath) return;

  const normalizedPath = listPath.startsWith("/") ? listPath : `/${listPath}`;

  if (!id) {
    navigate(normalizedPath);
    return;
  }

  navigate({
    pathname: normalizedPath,
    search: `?highlight=${encodeURIComponent(id)}`,
  });
};
