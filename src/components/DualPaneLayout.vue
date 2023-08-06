<template>
  <v-container class="h-100 mt-5 d-flex justify-center pt-10 px-6">
    <v-row class="h-100" style="max-width: 1200px">
      <v-col cols="12" md="7">
        <v-sheet rounded color="surface" class="px-9 pb-5 h-100 overflow-x-hidden">
          <div class="text-h4 py-8"><slot name="leftTitle"></slot></div>
          <slot name="left"></slot>
        </v-sheet>
      </v-col>

      <v-col cols="12" md="5">
        <v-sheet
          rounded
          color="surface"
          class="px-9 pb-5 h-100 overflow-x-hidden overflow-y-scroll"
        >
          <div class="text-h6 pt-9 pb-7"><slot name="rightTitle"></slot></div>
          <slot name="right"></slot>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.overflow-y-scroll {
  overflow-y: scroll;
}
</style>
