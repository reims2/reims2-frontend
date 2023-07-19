import { defineStore, acceptHMRUpdate } from 'pinia'
import { Notification } from '@/lib/notifications'
import { ReimsSite } from '@/model/ReimsModel'

export const useRootStore = defineStore(
  'root',
  () => {
    const notification = ref(null as Notification | null)
    const drawer = ref(true)
    const isDev = ref(import.meta.env.VITE_PVH_DEBUG === 'true' || false)
    const reimsSite = ref('sa' as ReimsSite)
    const version = ref<null | string>(import.meta.env.VITE_GIT_VERSION || null)
    function toggleDrawer() {
      drawer.value = !drawer.value
    }
    return {
      notification,
      drawer,
      isDev,
      reimsSite,
      version,
      toggleDrawer,
    }
  },
  { persist: true },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRootStore, import.meta.hot))
}
