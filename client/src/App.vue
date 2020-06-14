<template>
  <v-app dark>
    <v-app-bar app>
      <v-combobox solo hide-details label="Search"></v-combobox>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>
