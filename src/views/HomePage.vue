<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Giorgobistve</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleTheme">
            <ion-icon :icon="isDark ? sunnyOutline : moonOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Giorgobistve</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <div v-if="songs.length === 0" class="ion-padding">
        Loading songs...
      </div>
      <div v-else>
        <ion-list>
          <ion-item v-for="song in songs" 
                    :key="song.id" 
                    :router-link="'/song/' + song.id"
                    button>
            <ion-label>
              <h2>{{ song.title }}</h2>
              <p>{{ song.titleLatin }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/vue';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { LyricsService, Song } from '@/services/LyricsService';
import { ThemeService } from '@/services/ThemeService';

export default defineComponent({
  name: 'HomePage',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButtons,
    IonButton,
    IonIcon,
  },
  setup() {
    const lyricsService = new LyricsService();
    const songs = ref<Song[]>([]);
    const isDark = ref(document.documentElement.classList.contains('dark'));

    const loadSongs = async () => {
      console.log('Loading songs...');
      try {
        songs.value = await lyricsService.getSongList();
        console.log('Loaded songs:', songs.value);
      } catch (error) {
        console.error('Error loading songs:', error);
      }
    };

    const toggleTheme = () => {
      ThemeService.toggleTheme();
      isDark.value = !isDark.value;
    };

    onMounted(() => {
      loadSongs();
    });

    return {
      songs,
      isDark,
      toggleTheme,
      moonOutline,
      sunnyOutline
    };
  }
});
</script>

<style scoped>
ion-item {
  cursor: pointer;
}

ion-item h2 {
  font-family: 'Noto Sans Georgian', sans-serif;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

ion-item p {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}
</style>
