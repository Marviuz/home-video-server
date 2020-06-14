<template>
  <v-container>
    <v-list>
      <v-list-group v-for="i in 100" :key="i">

        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>Admin</v-list-item-title>
          </v-list-item-content>
        </template>

        <v-list-item v-for="c in 3" :key="`sg-i${c}`">
          <v-list-item-icon>
            <v-icon>mdi-film</v-icon>
          </v-list-item-icon>
          <v-list-item-title>band dream {{i}}</v-list-item-title>
        </v-list-item>

      </v-list-group>
    </v-list>
  </v-container>
</template>
