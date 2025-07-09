import { LyricsService, Song } from './LyricsService';

export interface SearchableSong extends Song {
  georgianText?: string;
  transliterationText?: string;
  searchableContent?: string;
}

export class SearchService {
  private lyricsService: LyricsService;
  private songsCache: SearchableSong[] = [];
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.lyricsService = new LyricsService();
  }

  /**
   * Preload all song content for fast searching
   */
  async preloadSongs(): Promise<void> {
    if (this.isLoaded || this.isLoading) {
      return this.loadPromise || Promise.resolve();
    }

    this.isLoading = true;
    this.loadPromise = this._loadAllSongs();
    
    try {
      await this.loadPromise;
      this.isLoaded = true;
    } finally {
      this.isLoading = false;
    }
  }

  private async _loadAllSongs(): Promise<void> {
    try {
      console.log('SearchService: Starting to preload all songs...');
      const songList = await this.lyricsService.getSongList();
      
      // Load all songs in parallel for better performance
      const loadPromises = songList.map(async (song) => {
        try {
          const fullSong = await this.lyricsService.getSong(song.id);
          if (fullSong) {
            const searchableSong: SearchableSong = {
              ...song,
              georgianText: this.stripHtml(fullSong.georgian || '').toLowerCase(),
              transliterationText: this.stripHtml(fullSong.transliteration || '').toLowerCase(),
            };
            
            // Create a combined searchable content
            searchableSong.searchableContent = [
              song.title.toLowerCase(),
              song.titleLatin.toLowerCase(),
              song.description?.toLowerCase() || '',
              searchableSong.georgianText,
              searchableSong.transliterationText
            ].join(' ');
            
            return searchableSong;
          }
        } catch (error) {
          console.error(`Error loading song ${song.id}:`, error);
          // Return basic song info even if lyrics fail to load
          return {
            ...song,
            searchableContent: [
              song.title.toLowerCase(),
              song.titleLatin.toLowerCase(),
              song.description?.toLowerCase() || ''
            ].join(' ')
          };
        }
        return null;
      });

      const results = await Promise.all(loadPromises);
      this.songsCache = results.filter(song => song !== null) as SearchableSong[];
      
      console.log(`SearchService: Preloaded ${this.songsCache.length} songs`);
    } catch (error) {
      console.error('SearchService: Error preloading songs:', error);
      throw error;
    }
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Search songs with optimized algorithm
   */
  async search(query: string): Promise<Song[]> {
    if (!query.trim()) {
      return this.songsCache.slice(); // Return copy of all songs
    }

    // Ensure songs are loaded
    if (!this.isLoaded) {
      await this.preloadSongs();
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);
    
    const results: Array<{ song: SearchableSong; score: number }> = [];

    for (const song of this.songsCache) {
      let score = 0;
      const searchContent = song.searchableContent || '';
      
      // Title exact match (highest priority)
      if (song.title.toLowerCase().includes(normalizedQuery) || 
          song.titleLatin.toLowerCase().includes(normalizedQuery)) {
        score += 100;
      }
      
      // Title word match
      for (const word of queryWords) {
        if (song.title.toLowerCase().includes(word) || 
            song.titleLatin.toLowerCase().includes(word)) {
          score += 50;
        }
      }
      
      // Content word match
      for (const word of queryWords) {
        if (searchContent.includes(word)) {
          score += 10;
        }
      }
      
      // Full query match in content
      if (searchContent.includes(normalizedQuery)) {
        score += 25;
      }
      
      if (score > 0) {
        results.push({ song, score });
      }
    }
    
    // Sort by score (highest first) and return songs
    return results
      .sort((a, b) => b.score - a.score)
      .map(result => result.song);
  }

  /**
   * Get all songs (cached)
   */
  async getAllSongs(): Promise<Song[]> {
    if (!this.isLoaded) {
      await this.preloadSongs();
    }
    return this.songsCache.slice();
  }

  /**
   * Check if songs are loaded
   */
  isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Check if currently loading
   */
  isCurrentlyLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Get cached song by ID
   */
  getCachedSong(songId: string): SearchableSong | null {
    return this.songsCache.find(song => song.id === songId) || null;
  }
} 