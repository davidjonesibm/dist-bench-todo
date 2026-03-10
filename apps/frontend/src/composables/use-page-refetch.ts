import { onMounted, onUnmounted } from 'vue'

/**
 * Refetches data when the page becomes visible (tab focus / window switch).
 * Also performs an initial fetch on mount.
 */
export function usePageRefetch(fetch: () => Promise<unknown>) {
  const onVisible = () => {
    if (document.visibilityState === 'visible') fetch()
  }

  onMounted(() => {
    fetch()
    document.addEventListener('visibilitychange', onVisible)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisible)
  })
}
