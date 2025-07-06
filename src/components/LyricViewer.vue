<template>
  <ion-content>
    <ion-segment v-model="selectedTab">
      <ion-segment-button value="georgian">
        <ion-label>ქართული</ion-label>
      </ion-segment-button>
      <ion-segment-button value="transliteration">
        <ion-label>Transliteration</ion-label>
      </ion-segment-button>
      <ion-segment-button value="performance">
        <ion-label>Performance</ion-label>
      </ion-segment-button>
    </ion-segment>

    <div class="lyrics-container">
      <div v-if="selectedTab === 'georgian'" class="lyrics georgian" v-html="song?.georgian"></div>
      <div v-if="selectedTab === 'transliteration'" class="lyrics latin" v-html="song?.transliteration"></div>
      <div v-if="selectedTab === 'performance'" class="performance" v-html="song?.performance"></div>
    </div>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { IonContent, IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue';
import { Song } from '@/services/LyricsService';

export default defineComponent({
  name: 'LyricViewer',
  components: {
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  },
  props: {
    song: {
      type: Object as PropType<Song>,
      required: true,
    },
  },
  setup() {
    const selectedTab = ref('georgian');

    return {
      selectedTab,
    };
  },
});
</script>

<style scoped>
.lyrics-container {
  padding: 1rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.lyrics {
  user-select: text;
  -webkit-user-select: text;
}

.lyrics.georgian {
  font-family: 'Noto Sans Georgian', sans-serif;
}

.lyrics.latin {
  font-family: system-ui, -apple-system, sans-serif;
}

/* Paragraph styling for proper verse grouping */
.lyrics :deep(p) {
  margin: 0 0 3rem 0;
  padding: 0;
  white-space: pre-line;
  line-height: 1.2;
}

/* Remove margin from the last paragraph */
.lyrics :deep(p:last-child) {
  margin-bottom: 0;
}

.performance {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.performance :deep(iframe) {
  max-width: 100%;
  width: 560px;
  height: 315px;
  border: none;
}
</style>
