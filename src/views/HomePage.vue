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

      <!-- Filter Section -->
      <div class="filter-container ion-padding-top">
        <ion-searchbar 
          v-model="searchQuery"
          placeholder="Search songs by title or lyrics..."
          :debounce="300"
          @ionInput="handleSearch"
          show-clear-button="focus"
          class="custom-searchbar">
        </ion-searchbar>
      </div>
      
      <div v-if="isSearching" class="ion-padding ion-text-center">
        <ion-spinner name="dots"></ion-spinner>
        <p>Searching through lyrics...</p>
      </div>
      
      <div v-else-if="songs.length === 0 && allSongs.length === 0" class="ion-padding">
        Loading songs...
      </div>
      <div v-else-if="songs.length === 0 && searchQuery" class="ion-padding ion-text-center">
        <p>No songs found matching "{{ searchQuery }}"</p>
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
  IonIcon,
  IonSearchbar,
  IonSpinner
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
    IonSearchbar,
    IonSpinner,
  },
  setup() {
    const lyricsService = new LyricsService();
    const songs = ref<Song[]>([]);
    const allSongs = ref<Song[]>([]);
    const searchQuery = ref('');
    const isSearching = ref(false);
    const isDark = ref(document.documentElement.classList.contains('dark'));

    const loadSongs = async () => {
      console.log('Loading songs...');
      try {
        const loadedSongs = await lyricsService.getSongList();
        allSongs.value = loadedSongs;
        songs.value = loadedSongs;
        console.log('Loaded songs:', songs.value);
      } catch (error) {
        console.error('Error loading songs:', error);
      }
    };

    const handleSearch = async (event: any) => {
      const query = event.target.value.toLowerCase().trim();
      searchQuery.value = query;
      
      if (!query) {
        songs.value = allSongs.value;
        return;
      }

      isSearching.value = true;
      
      try {
        // First filter by title
        const titleMatches = allSongs.value.filter(song => 
          song.title.toLowerCase().includes(query) || 
          song.titleLatin.toLowerCase().includes(query)
        );

        // Then search through lyrics content
        const lyricsMatches = [];
        for (const song of allSongs.value) {
          try {
            const fullSong = await lyricsService.getSong(song.id);
            if (fullSong && !titleMatches.find(s => s.id === song.id)) {
              const georgianText = fullSong.georgian?.toLowerCase() || '';
              const transliterationText = fullSong.transliteration?.toLowerCase() || '';
              
              if (georgianText.includes(query) || transliterationText.includes(query)) {
                lyricsMatches.push(song);
              }
            }
          } catch (error) {
            console.error(`Error searching in song ${song.id}:`, error);
          }
        }

        // Combine results (title matches first, then lyrics matches)
        songs.value = [...titleMatches, ...lyricsMatches];
      } catch (error) {
        console.error('Error during search:', error);
        songs.value = allSongs.value;
      } finally {
        isSearching.value = false;
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
      allSongs,
      searchQuery,
      isSearching,
      isDark,
      handleSearch,
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

.filter-container {
  background: var(--ion-background-color);
  border-bottom: 1px solid var(--ion-color-light);
}

.custom-searchbar {
  --placeholder-color: var(--ion-color-medium);
  --icon-color: var(--ion-color-medium);
  --clear-button-color: var(--ion-color-medium);
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  margin: 0;
  width: 100%;
}
</style>
