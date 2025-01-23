<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>
          <div class="title-container">
            <div class="georgian">{{ song?.title }}</div>
            <div class="latin">{{ song?.titleLatin }}</div>
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toggleTheme">
            <ion-icon :icon="isDark ? sunnyOutline : moonOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <lyric-viewer v-if="song" :song="song" />
      <div v-else class="ion-padding">
        Loading song...
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon
} from '@ionic/vue';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { LyricsService, Song } from '@/services/LyricsService';
import { ThemeService } from '@/services/ThemeService';
import LyricViewer from '@/components/LyricViewer.vue';

export default defineComponent({
  name: 'SongDetailPage',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    LyricViewer,
  },
  setup() {
    const route = useRoute();
    const song = ref<Song | null>(null);
    const isDark = ref(document.documentElement.classList.contains('dark'));
    const lyricsService = new LyricsService();

    const loadSong = async () => {
      const songId = route.params.id as string;
      const loadedSong = await lyricsService.getSong(songId);
      if (loadedSong) {
        song.value = loadedSong;
      }
    };

    const toggleTheme = () => {
      ThemeService.toggleTheme();
      isDark.value = !isDark.value;
    };

    onMounted(() => {
      loadSong();
    });

    return {
      song,
      isDark,
      toggleTheme,
      moonOutline,
      sunnyOutline
    };
  },
});
</script>

<style scoped>
.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}

.georgian {
  font-family: 'Noto Sans Georgian', sans-serif;
  font-size: 1.1rem;
}

.latin {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}
</style>
