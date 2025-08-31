// Symbolisiert eine Log-Zeile.
export class Entry {
  date: string;
  time: string;
  level: string;
  source: string;
  message: string;

  constructor(date: string, time: string, level: string, source: string, message: string) {
    this.date = date;
    this.time = time;
    this.level = level;
    this.source = source;
    this.message = message;
  }

  static fromRegexMatch(match: RegExpMatchArray): Entry {
    return new Entry(
      match[1], // Datum
      match[2], // Uhrzeit
      match[3], // Level
      match[4], // Anwendung
      match[5].trim() // Inhalt
    );
  }

  containsSearchTerm(searchTerm: string): boolean {
    if (!searchTerm || searchTerm.trim() === '') {
      return true;
    }

    return this.message.toLowerCase().includes(searchTerm.toLowerCase());
  }

  doesNotContainExcludeTerms(excludeTerms: string[]): boolean {
    if (!excludeTerms || excludeTerms.length === 0) {
      return true;
    }

    return !excludeTerms.some(
      (term) => term.trim() !== '' && this.message.toLowerCase().includes(term.toLowerCase())
    );
  }
}
