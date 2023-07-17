import { Glasses, GlassesInput, GlassesResult, GlassesSearch } from '@/model/GlassesModel'
import calculateAllPhilscore from '@/lib/philscore'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useRootStore } from './root'
import axios from 'axios'
import { useAxios } from '@/lib/axios'

const arrayContainsSku = (data: Glasses[], sku: number) => data.some((e) => e.sku === sku)

let cancelTokenGet = axios.CancelToken.source()

export const useGlassesStore = defineStore(
  'glasses',
  () => {
    const axiosInstance = useAxios()
    const allGlasses = ref([] as Glasses[])
    const lastRefresh = ref(null as string | null)
    const isOutdated = ref(false)
    const isRefreshingGlasses = ref(false)

    const hasGlassesLoaded = computed(() => {
      return allGlasses.value.length > 0
    })
    const getSingle = (sku: number) => {
      return allGlasses.value.find((glass) => glass.sku === sku)
    }

    async function addGlasses(newGlasses: GlassesInput): Promise<Glasses> {
      const request = Object.assign({}, newGlasses) as any
      const rootStore = useRootStore()
      request.location = rootStore.reimsSite
      const response = await axiosInstance.post('/api/glasses', request)
      const addedGlasses = response.data
      addOfflineGlasses(addedGlasses)
      return addedGlasses
    }
    async function fetchSingle(sku: number): Promise<Glasses> {
      const rootStore = useRootStore()
      if (cancelTokenGet) cancelTokenGet.cancel()
      cancelTokenGet = axios.CancelToken.source()
      let response
      try {
        response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}/${sku}`, {
          cancelToken: cancelTokenGet.token,
        })
      } catch (e) {
        if ((e as any).response && (e as any).response.status === 404) {
          // delete glasses from local db if it doesn't exist on server
          deleteOfflineGlasses(sku)
        }
        throw e
      }

      const fetchedGlasses = response.data
      deleteOfflineGlasses(sku)
      addOfflineGlasses(fetchedGlasses)
      return fetchedGlasses
    }
    async function dispense(sku: number, reason: string) {
      const rootStore = useRootStore()
      await axiosInstance.put(
        `/api/glasses/dispense/${rootStore.reimsSite}/${sku}?reason=${reason}`,
        {},
      )
      deleteOfflineGlasses(sku)
    }
    async function undispense(glasses: Glasses) {
      await axiosInstance.put(`/api/glasses/undispense/${glasses.id}`, {})
      addOfflineGlasses(glasses)
    }
    async function deleteGlasses(sku: number) {
      const rootStore = useRootStore()
      await axiosInstance.delete(`/api/glasses/${rootStore.reimsSite}/${sku}`)
      deleteOfflineGlasses(sku)
    }
    async function editGlasses(newGlasses: Glasses): Promise<Glasses> {
      const rootStore = useRootStore()
      const response = await axiosInstance.put(
        `/api/glasses/${rootStore.reimsSite}/${newGlasses.sku}`,
        newGlasses,
      )
      const editedGlasses = response.data
      addOfflineGlasses(editedGlasses)
      return editedGlasses
    }
    function philScore(terms: GlassesSearch): GlassesResult[] {
      return calculateAllPhilscore(terms, allGlasses.value || ([] as Glasses[]))
    }
    async function loadDispensedCsv(startDate: string, endDate: string): Promise<any> {
      const rootStore = useRootStore()
      const params: any = { startDate, endDate }
      const response = await axiosInstance.get(
        `/api/glasses/dispensed/${rootStore.reimsSite}.csv`,
        {
          params,
          responseType: 'blob',
        },
      )
      return response.data
    }
    async function loadInventoryCsv(): Promise<any> {
      const rootStore = useRootStore()
      const response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}.csv`, {
        responseType: 'blob',
      })
      return response.data
    }
    async function loadGlasses() {
      const rootStore = useRootStore()
      const response = await axiosInstance.get(`/api/glasses/${rootStore.reimsSite}`, {
        params: { size: 100000 },
        timeout: 60000,
      })
      allGlasses.value = response.data.glasses
      lastRefresh.value = new Date().toISOString()
      isOutdated.value = false
      isRefreshingGlasses.value = false
    }
    function addOfflineGlasses(glasses: Glasses) {
      if (!arrayContainsSku(allGlasses.value, glasses.sku)) {
        allGlasses.value.push(glasses)
      }
    }
    function deleteOfflineGlasses(sku: number) {
      if (arrayContainsSku(allGlasses.value, sku)) {
        // call arrayContainsSku to avoid unnecessary reactive changes when replacing the array like this TODO
        allGlasses.value = allGlasses.value.filter((el) => el.sku !== sku)
      }
    }

    return {
      allGlasses,
      lastRefresh,
      isOutdated,
      isRefreshingGlasses,
      hasGlassesLoaded,
      getSingle,
      addGlasses,
      fetchSingle,
      dispense,
      undispense,
      deleteGlasses,
      editGlasses,
      philScore,
      loadDispensedCsv,
      loadInventoryCsv,
      loadGlasses,
      addOfflineGlasses,
      deleteOfflineGlasses,
    }
  },
  { persist: { paths: ['allGlasses', 'lastRefresh'] } },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGlassesStore, import.meta.hot))
}
