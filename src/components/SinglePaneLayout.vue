<template>
  <v-container class="h-100 mt-5 pt-10 px-6">
    <v-row class="h-100 d-flex justify-center">
      <v-col cols="12" :md="props.cols">
        <v-sheet rounded color="surface" class="px-9 pb-5 h-100">
          <div class="text-h4 py-7"><slot name="title"></slot></div>
          <slot></slot>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    cols?: number | string
  }>(),
  {
    cols: 12,
  },
)
</script>
