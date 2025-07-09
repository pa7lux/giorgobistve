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
          :debounce="150"
          @ionInput="handleSearch"
          show-clear-button="focus"
          class="custom-searchbar">
        </ion-searchbar>
      </div>
      
      <div v-if="isSearching" class="ion-padding ion-text-center">
        <ion-spinner name="dots"></ion-spinner>
        <p>Searching through lyrics...</p>
      </div>
      
      <div v-else-if="isLoadingInitial" class="ion-padding">
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
import { Song } from '@/services/LyricsService';
import { SearchService } from '@/services/SearchService';
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
    const searchService = new SearchService();
    const songs = ref<Song[]>([]);
    const searchQuery = ref('');
    const isSearching = ref(false);
    const isLoadingInitial = ref(true);
    const isDark = ref(document.documentElement.classList.contains('dark'));

    const loadSongs = async () => {
      console.log('Loading songs...');
      try {
        // Start preloading in background
        searchService.preloadSongs().catch(error => {
          console.error('Background preloading failed:', error);
        });

        // Get initial song list quickly
        const initialSongs = await searchService.getAllSongs();
        songs.value = initialSongs;
        console.log('Loaded songs:', songs.value);
      } catch (error) {
        console.error('Error loading songs:', error);
      } finally {
        isLoadingInitial.value = false;
      }
    };

    const handleSearch = async (event: any) => {
      const query = event.target.value.toLowerCase().trim();
      searchQuery.value = query;
      
      // Don't show loading for empty searches
      if (!query) {
        const allSongs = await searchService.getAllSongs();
        songs.value = allSongs;
        return;
      }

      // Only show loading indicator if search service isn't ready yet
      if (!searchService.isReady()) {
        isSearching.value = true;
      }
      
      try {
        const results = await searchService.search(query);
        songs.value = results;
      } catch (error) {
        console.error('Error during search:', error);
        // Fallback to all songs on error
        const allSongs = await searchService.getAllSongs();
        songs.value = allSongs;
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
      searchQuery,
      isSearching,
      isLoadingInitial,
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
