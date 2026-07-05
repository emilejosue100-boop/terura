export function getDefaultAvatarUrl(name: string): string {
  const label = encodeURIComponent(name.trim() || 'Member');
  return `https://ui-avatars.com/api/?name=${label}&background=1F5C3F&color=fff&size=120`;
}
