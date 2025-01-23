import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,  // Enable HTML tags in source
  breaks: true,  // Convert '\n' in paragraphs into <br>
});

export interface Song {
  id: string;
  title: string;
  titleLatin: string;
  file: string;
  georgian?: string;
  transliteration?: string;
  performance?: string;
}

export interface SongIndex {
  songs: Song[];
}

export class LyricsService {
  async getSongList(): Promise<Song[]> {
    try {
      const response = await fetch('/lyrics/index.json');
      const data: SongIndex = await response.json();
      return data.songs;
    } catch (error) {
      console.error('Error loading song list:', error);
      return [];
    }
  }

  async getSong(songId: string): Promise<Song | null> {
    try {
      // First get the song metadata from index
      const songs = await this.getSongList();
      const songMeta = songs.find(s => s.id === songId);
      
      if (!songMeta) {
        throw new Error(`Song with id ${songId} not found`);
      }

      // Then load the song content
      const response = await fetch(`/lyrics/${songMeta.file}`);
      const markdown = await response.text();
      
      // Parse the markdown content
      const sections = this.parseLyrics(markdown);
      
      return {
        ...songMeta,
        georgian: sections.georgian,
        transliteration: sections.transliteration,
        performance: sections.performance
      };
    } catch (error) {
      console.error('Error loading song:', error);
      return null;
    }
  }

  private parseLyrics(markdown: string): { georgian: string; transliteration: string; performance: string } {
    const lines = markdown.split('\n');
    let currentSection = '';
    let georgian = '';
    let transliteration = '';
    let performance = '';

    for (const line of lines) {
      if (line.startsWith('# Georgian')) {
        currentSection = 'georgian';
      } else if (line.startsWith('# Transliteration')) {
        currentSection = 'transliteration';
      } else if (line.startsWith('# Performance')) {
        currentSection = 'performance';
      } else if (line.trim()) {
        if (currentSection === 'georgian') {
          georgian += line + '\n';
        } else if (currentSection === 'transliteration') {
          transliteration += line + '\n';
        } else if (currentSection === 'performance') {
          performance += line + '\n';
        }
      }
    }

    return {
      georgian: md.render(georgian.trim()),
      transliteration: md.render(transliteration.trim()),
      performance: md.render(performance.trim())
    };
  }
}
