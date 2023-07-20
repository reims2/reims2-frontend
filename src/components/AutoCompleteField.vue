<template>
  <v-text-field
    ref="input"
    v-model="inputVal"
    :label="label"
    :rules="rules"
    :hint="hint"
    :autofocus="first && !mobile"
    clearable
    :persistent-hint="persistentHint"
    hide-details="auto"
    autocorrect="off"
    autocapitalize="off"
    @keyup.a.stop
    @keyup.s.stop
    @blur="autoComplete()"
    @focus="$event.target.select()"
  />
</template>

<script setup lang="ts">
import { GeneralGlassesData } from '@/model/GlassesModel'
import { ValidationRule } from '@/model/ReimsModel'

import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

interface Props {
  modelValue?: string
  label: string
  rules: ValidationRule[]
  hint: string
  items: GeneralGlassesData[]
  first?: boolean
  persistentHint?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  first: false,
  persistentHint: false,
})
const emit = defineEmits(['update:modelValue'])

const input = ref<HTMLInputElement | null>(null)

focus()

const inputVal = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

function autoComplete() {
  /** autocomplete item data based on first characters. i.e. for id=glassesType return single for character s.
   * Otherwise emit no input i.e. no change */
  const glassesString = inputVal.value
  if (!glassesString || typeof glassesString !== 'string' || glassesString === '') return

  for (const item of props.items) {
    if (item.startsWith(glassesString.toLowerCase())) return emit('update:modelValue', item)
  }
}

function focus() {
  input.value?.focus()
}
</script>