<template>
  <v-bottom-navigation app color="accent" light grow>
    <v-btn v-for="item in items" :key="item.to" :to="item.to" :disabled="item.disabled || false">
      <v-icon size="large">{{ item.icon }}</v-icon>
      <span>{{ item.title }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { DrawerItem } from '@/model/ReimsModel'

defineProps<{
  items: DrawerItem[]
}>()
</script>
