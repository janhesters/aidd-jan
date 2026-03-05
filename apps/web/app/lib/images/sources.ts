const LOCAL_IMAGE_SOURCES = {
  dashboardDark: "/images/screen/dashboard-dark.webp",
  dashboardLight: "/images/screen/dashboard-light.webp",
} as const;

export type LocalImageKey = keyof typeof LOCAL_IMAGE_SOURCES;

export function getLocalImageSrc(key: LocalImageKey): string {
  return LOCAL_IMAGE_SOURCES[key];
}
