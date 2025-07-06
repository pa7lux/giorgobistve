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
      } else if (currentSection) {
        // Add the line (including empty lines) to preserve paragraph structure
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
      georgian: this.processLyrics(georgian.trim()),
      transliteration: this.processLyrics(transliteration.trim()),
      performance: md.render(performance.trim())
    };
  }

  private processLyrics(lyrics: string): string {
    // Split by double newlines to create paragraphs
    const paragraphs = lyrics.split('\n\n').filter(p => p.trim());
    
    console.log('processLyrics called with', paragraphs.length, 'paragraphs');
    
    // Create HTML paragraphs directly to ensure proper structure
    const processedParagraphs = paragraphs.map((paragraph, index) => {
      const lines = paragraph.split('\n').filter(line => line.trim());
      // Create HTML paragraph with line breaks
      const content = lines.join('<br>\n');
      const result = `<p>${content}</p>`;
      console.log(`Paragraph ${index + 1}:`, result);
      return result;
    });
    
    const final = processedParagraphs.join('\n');
    console.log('Final HTML output:', final);
    return final;
  }
}
