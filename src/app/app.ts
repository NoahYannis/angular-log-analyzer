import { Component, signal, ViewChild, AfterViewInit, inject, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Entry } from './models/entry';
import { Settings } from './models/settings';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSlideToggleModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatCheckboxModule,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected readonly title = signal('angular-log-analyzer');

  // Key zum Speichern und Abfragen von Einstellungen aus dem LocalStorage
  private readonly LOG_ANALYZER_SETTINGS_KEY: string = 'log_analyzer_settings';

  // Log-Format von HottCAD
  // Zuerst wird das Datum ermittelt (4 Zifern, Bindestrich, 2 Ziffern, Bindestrich, 2 Ziffern).
  // Dann die Uhrzeit (2 Ziffern, Doppelpunkt, 2 Ziffern, Doppelpunkt, 2 Ziffern).
  // Dann das Loglevel und die Quelle in eckigen Klammern.
  // Schließlich der Inhalt mit ener beliebigen Zeichenanzahl (.+)
  private hottCadLogRegex: RegExp =
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+\[(\w+)\]\s+\[(\w+)\]\s*(.+)$/;

  // Einstellungen verzögert im LocalStorage speichern (Performance)
  private saveTimeout?: number;

  // Enthält alle Einstellungen (Regex, Filter...)
  logSettings: Settings = Settings.createGlobal();

  // Name der eingelesenen Datei inklusive deren Größe.
  logFileName: string = 'Log einlesen';

  // Alle Log-Stufen (Info, Warning, Error..)
  logLevels: string[] = [];

  // Die Quelle/Anwendung (HottCAD, DAL, MOD...)
  sourceApps: string[] = [];

  // Dient zur Anzeige des Spinners während des Einlesens der Log-Datei
  isProcessing: boolean = false;

  // Drag & Drop Status
  isDragOver: boolean = false;

  // Tabellenkopf
  displayedColumns: string[] = ['date', 'time', 'level', 'source', 'message'];

  // Alle in der Log-Datei gefundenen Einträge
  logEntries = new MatTableDataSource<Entry>([]);

  // Alle Einträge, die den Filterkriterien entsprechen.
  filteredEntries = new MatTableDataSource<Entry>([]);

  // Popup anzeigen, falls keine Logs gefunden werden konnten
  snackBar: MatSnackBar = inject(MatSnackBar);

  // Dient zur Sortierung der Tabelle
  @ViewChild(MatSort) sort!: MatSort;

  // Dient zur Paginierung der Tabelle
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Der Log-Container. Wird durch das #logDisplay im HTML verknüpft.
  @ViewChild('logDisplay', { read: ElementRef }) logDisplay!: ElementRef;

  ngOnInit(): void {
    const savedSettings = localStorage.getItem(this.LOG_ANALYZER_SETTINGS_KEY);
    if (savedSettings) {
      this.logSettings = JSON.parse(savedSettings);
    }
  }

  ngAfterViewInit() {
    this.filteredEntries.sort = this.sort;
    this.filteredEntries.paginator = this.paginator;
  }

  selectLogFile() {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.log';
      input.style.display = 'none';

      input.addEventListener('change', (event: any) => {
        const file = event.target.files[0];
        if (file) {
          this.processFile(file);
        }
      });

      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    } catch (error) {
      console.error(error);
    } finally {
      this.isProcessing = false;
    }
  }

  private processFile(file: File) {
    this.resetFilters();
    this.logFileName = `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
    this.isProcessing = true;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.parseLogContent(content);
      this.isProcessing = false;
    };

    reader.onerror = (error) => {
      this.snackBar.open('Fehler beim Lesen der Datei', 'OK', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-bottom-margin'],
      });
      console.error('FileReader Fehler:', error);
      this.isProcessing = false;
    };

    reader.readAsText(file);
  }

  private parseLogContent(content: string) {
    try {
      // Datei in Zeilen aufteilen
      const lines = content.split('\n');
      let parsedLogs: Entry[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '') {
          continue;
        }

        const match = line.match(this.hottCadLogRegex);

        // Log-Zeile entspricht dem korrekten Schema.
        if (match) {
          const logEntry: Entry = Entry.fromRegexMatch(match);

          if (!this.logLevels.includes(logEntry.level)) {
            this.logLevels.push(logEntry.level);
            this.logSettings.toggleSettings[logEntry.level] = this.logSettings.settingsGlobal
              ? this.logSettings.toggleSettings[logEntry.level] ?? true // Bisherige Einstellung oder true falls undefined
              : true;
          }

          if (!this.sourceApps.includes(logEntry.source)) {
            this.sourceApps.push(logEntry.source);
            this.logSettings.toggleSettings[logEntry.source] = this.logSettings.settingsGlobal
              ? this.logSettings.toggleSettings[logEntry.source] ?? true // Bisherige Einstellung oder true falls undefined
              : true;
          }

          parsedLogs.push(logEntry);
        }
      }

      if (this.logSettings.onlyUniqueEntries) {
        parsedLogs = this.getUniqueEntries();
      }

      // Tabelle aktualisieren
      if (parsedLogs.length > 0) {
        this.logEntries.data = parsedLogs;
        this.filteredEntries.data = this.logEntries.data.filter((e) => this.meetsFilterCriteria(e));
        this.filteredEntries.sort = this.sort;
        this.filteredEntries.paginator = this.paginator;
        return;
      }

      this.snackBar.open(
        'Keine Log-Einträge gefunden. Einträge müssen folgendem Format entsprechen: YYYY-MM-DD HH:MM:SS [LEVEL] [QUELLE] Nachricht',
        'OK',
        {
          duration: 8000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-bottom-margin'],
        }
      );
    } catch (error) {
      this.snackBar.open(`Fehler beim Parsen der Log-Datei: ${error}`, 'OK', {
        duration: 8000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-bottom-margin'],
      });
      console.error('Parse-Fehler:', error);
    } finally {
      this.isProcessing = false; // Spinner ausblenden.
    }
  }

  applyToggleFilter(event: MatSlideToggleChange) {
    let toggle: string = event.source.id;
    this.logSettings.toggleSettings[toggle] = event.source.checked;

    // Tabelle nur bei vorhandenen Einträgen neu laden
    if (this.logEntries.data.length < 1) {
      return;
    }

    this.applySettings();
  }

  applySettings() {
    this.delayedSettingsSave();
    this.filterEntries();
  }

  private filterEntries() {
    this.isProcessing = true;

    setTimeout(() => {
      let filteredData = this.logEntries.data.filter((entry) => this.meetsFilterCriteria(entry));

      if (this.logSettings.onlyUniqueEntries) {
        filteredData = this.getUniqueEntries();
      }

      this.filteredEntries.data = filteredData;

      if (this.paginator) {
        this.paginator.firstPage();
      }
      this.isProcessing = false;
    }, 0);
  }

  meetsFilterCriteria(entry: Entry): boolean {
    const disabledSettings = Object.keys(this.logSettings.toggleSettings).filter(
      (toggle) => !this.logSettings.toggleSettings[toggle]
    );

    // Der Toggle für das Log-Level und die Quelle müssen aktiv sein.
    const levelAndSourceActive =
      !disabledSettings.includes(entry.level) && !disabledSettings.includes(entry.source);

    // Falls ein Suchbegriff eingegeben wurde muss dieser enthalten sein.
    const matchesSearchTerm = entry.containsSearchTerm(this.logSettings.includeTerm);

    const excludeTerms = this.logSettings.exludeTerm
      .split(';')
      .map((term) => term.trim())
      .filter((term) => term !== '');

    const doesNotContainExcludeTerms = entry.doesNotContainExcludeTerms(excludeTerms);

    return levelAndSourceActive && matchesSearchTerm && doesNotContainExcludeTerms;
  }

  private resetFilters() {
    this.logFileName = 'Log einlesen';
    this.logLevels = [];
    this.sourceApps = [];

    if (!this.logSettings.settingsGlobal) {
      this.logSettings = Settings.createLocal();
    }
  }

  // Gespeicherte Einstellungen verzögert im LocalStorage speichenr
  private delayedSettingsSave(): void {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      localStorage.setItem(this.LOG_ANALYZER_SETTINGS_KEY, JSON.stringify(this.logSettings));
    }, 5000);
  }

  private getUniqueEntries(): Entry[] {
    const seen = new Set<string>();
    return this.logEntries.data.filter((entry) => {
      const key = `${entry.date}_${entry.time}_${entry.level}_${entry.source}_${entry.message}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    if (!file.type.includes('text') && !file.name.endsWith('.log') && !file.name.endsWith('.txt')) {
      this.snackBar.open('Bitte eine gültige Log-Datei auswählen (.txt, .log)', 'OK', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-bottom-margin'],
      });
      return;
    }

    this.processFile(file);
  }

  scrollToTop(): void {
    const rect = this.logDisplay.nativeElement.getBoundingClientRect();
    const offsetTop = window.pageYOffset + rect.top;
    window.scrollTo({
      top: offsetTop - 300,
      behavior: 'smooth',
    });
  }
}
