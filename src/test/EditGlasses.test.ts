import { test, vi } from 'vitest'
import { renderWithVuetify } from './util'

import { useGlassesStore } from '@/stores/glasses'
import EditGlasses from '@/views/EditGlasses.vue'
import { createTestingPinia } from '@pinia/testing'
import { Glasses } from '@/model/GlassesModel'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'

const testGlasses: Glasses = {
  id: 1,
  sku: null,
  glassesType: 'single',
  glassesSize: 'small',
  appearance: 'neutral',
  location: 'sa',
  dispensed: true,
  creationDate: 1,
  dispense: {
    modifyDate: 1691953285200,
    previousSku: 10,
    dispenseReason: 'DISPENSED',
  },
  os: {
    sphere: 1,
    cylinder: -1,
    axis: 1,
  },
  od: {
    sphere: 1,
    cylinder: -1,
    axis: 1,
  },
}

test('should show placeholder when no recently dispensed glasses', async () => {
  const pinia = createTestingPinia()
  const glassesStore = useGlassesStore()
  vi.mocked(glassesStore.getDispensedGlasses).mockResolvedValue([testGlasses])

  const wrapper = renderWithVuetify(EditGlasses, {}, pinia)

  expect(glassesStore.getDispensedGlasses).toHaveBeenCalled()
  wrapper.getByText('No glasses were dispensed or deleted recently.')
})

test('should show previous SKU of recently dispensed glass', async () => {
  const pinia = createTestingPinia()
  const glassesStore = useGlassesStore()
  vi.mocked(glassesStore.getDispensedGlasses).mockResolvedValue([])

  const wrapper = renderWithVuetify(EditGlasses, {}, pinia)

  await flushPromises()
  expect(glassesStore.getDispensedGlasses).toHaveBeenCalled()
  wrapper.getByText('0010')
})
