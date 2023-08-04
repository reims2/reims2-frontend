import { defineStore, acceptHMRUpdate } from 'pinia'
import { ReimsSite } from '@/model/ReimsModel'
import { Glasses } from '@/model/GlassesModel'

const reimsSiteNames: { [site in ReimsSite]: string } = {
  sa: 'Santa Ana',
  sm: 'San Miguel',
}

export const useRootStore = defineStore(
  'root',
  () => {
    const notification = ref(null as Notification | null)
    const drawer = ref(true)
    const isDev = ref(import.meta.env.VITE_PVH_DEBUG === 'true' || false)
    const reimsSite = ref('sa' as ReimsSite)
    const version = ref<null | string>(import.meta.env.VITE_GIT_VERSION || null)
    const reimsSiteName = computed(() => reimsSiteNames[reimsSite.value])
    const lastDispensedGlasses = ref([] as Glasses[])
    const lastAddedSkus = ref([] as number[])
    function toggleDrawer() {
      drawer.value = !drawer.value
    }
    return {
      notification,
      drawer,
      isDev,
      reimsSite,
      reimsSiteName,
      version,
      lastDispensedGlasses,
      lastAddedSkus,
      toggleDrawer,
    }
  },
  { persist: true },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRootStore, import.meta.hot))
}
