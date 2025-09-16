export class Settings {
  // Speichert die Aktivität der jeweiligen Toggle-Filter.
  toggleSettings: { [key: string]: boolean } = {};

  // Suchbegriff falls eingegeben
  includeTerm: string = '';

  // Herauszufilternde Begriffe (durch Semikolons separiert)
  exludeTerm: string = '';

  // Einstellungen für alle Logs anwenden.
  settingsGlobal: boolean = true;

  // Nur einzigartige Einträge anzeigen
  onlyUniqueEntries: boolean = true;

  static createGlobal(): Settings {
    return new Settings();
  }

  static createLocal(): Settings {
    const settings = new Settings();
    settings.settingsGlobal = false;
    return settings;
  }
}
