import { useTableStore } from '@/stores/table'
import { Glasses } from '@/model/GlassesModel'
import { useToast } from 'vue-toastification'
import { ReimsAxiosError } from '@/lib/axios'

import { TableSortBy } from '@/model/ReimsModel'
import { formatGlassesForDisplay } from '@/util/format-glasses'
import { useGlassesStore } from '@/stores/glasses'
import { useRootStore } from '@/stores/root'

export const useTableData = (
  currentPage: Ref<number>,
  itemsPerPage: Ref<number>,
  sortBy: Ref<TableSortBy[]>,
  filterString?: Ref<string> | string,
) => {
  const toast = useToast()

  const tableStore = useTableStore()
  const glassesStore = useGlassesStore()
  const rootStore = useRootStore()
  const allGlassesHash = computed(() => glassesStore.allGlassesHash)
  const reimsSite = computed(() => rootStore.reimsSite)

  const loading = ref(false)
  const items = ref([])
  const totalItems = ref(0)

  const formattedItems = computed(() => {
    return items.value.map((item: Glasses) => formatGlassesForDisplay(item))
  })

  watch(
    [filterString, itemsPerPage, sortBy, currentPage, allGlassesHash, reimsSite],
    () => {
      startLoading()
    },
    { immediate: true },
  )

  async function startLoading() {
    loading.value = true
    try {
      const result = await tableStore.loadItems(
        currentPage.value,
        itemsPerPage.value,
        toValue(filterString ?? ''),
        sortBy.value[0],
      )
      items.value = result.glasses
      totalItems.value = result.totalItems
    } catch (error) {
      if (error instanceof ReimsAxiosError && error.statusCode === 404) {
        items.value = []
      } else {
        toast.error(`Could not load table data, please retry (${error.message})`)
      }
    } finally {
      loading.value = false
    }
  }
  return {
    formattedItems,
    totalItems,
    loading,
    startLoading,
  }
}
