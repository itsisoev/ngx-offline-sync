export interface IAppShellCacheConfig {
  /**
   * Enables caching of the app shell (HTML/CSS/JS/fonts) via a Service Worker,
   * so the page still opens when the user reloads it while offline.
   * @default false
   */
  enabled?: boolean;

  /**
   * Path to the service worker file, served from the site root.
   * @default '/ngx-offline-sync-sw.js'
   */
  swPath?: string;
}
