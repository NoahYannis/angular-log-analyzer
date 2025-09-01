import { Component, signal, ViewChild, AfterViewInit, inject } from '@angular/core';
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
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Entry } from './models/entry';

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
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected readonly title = signal('angular-log-analyzer');

  // Name der eingelesenen Datei inklusive deren Größe.
  logFileName: string = 'Log einlesen';

  // Speichert die Aktivität der jeweiligen Toggle-Filter.
  toggleSettings: { [level: string]: boolean } = {};

  // Alle Log-Stufen (Info, Warning, Error..)
  logLevels: string[] = [];

  // Die Quelle/Anwendung (HottCAD, DAL, MOD...)
  sourceApps: string[] = [];

  // Suchbegriff falls eingegeben
  includeTerm: string = '';

  // Herauszufilternde Begriffe (durch Semikolons separiert)
  exludeTerm: string = '';

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

  ngAfterViewInit() {
    this.logEntries.sort = this.sort;
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
      const parsedLogs: Entry[] = [];

      // Der Regex-Ausdruck um die Einträge zu analysieren.
      // Zuerst wird das Datum ermittelt (4 Zifern, Bindestrich, 2 Ziffern, Bindestrich, 2 Ziffern).
      // Dann die Uhrzeit (2 Ziffern, Doppelpunkt, 2 Ziffern, Doppelpunkt, 2 Ziffern).
      // Dann das Loglevel und die Quelle in eckigen Klammern.
      // Schließlich der Inhalt mit ener beliebigen Zeichenanzahl (.+)
      const logRegex = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+\[(\w+)\]\s+\[(\w+)\]\s*(.+)$/;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === '') {
          continue;
        }

        const match = line.match(logRegex);

        // Log-Zeile entspricht dem korrekten Schema.
        if (match) {
          const logEntry: Entry = Entry.fromRegexMatch(match);

          if (!this.logLevels.includes(logEntry.level)) {
            this.logLevels.push(logEntry.level);
          }

          if (!this.sourceApps.includes(logEntry.source)) {
            this.sourceApps.push(logEntry.source);
          }

          parsedLogs.push(logEntry);
        }
      }

      // Tabelle aktualisieren
      if (parsedLogs.length > 0) {
        this.logEntries.data = parsedLogs;
        this.filteredEntries.data = this.logEntries.data;
        return;
      }

      this.snackBar.open('Keine Log-Einträge gefunden :/', 'OK', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-bottom-margin'],
      });
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

  // Suche und Ausschluss von Begriffen
  applySearchFilter() {
    if (this.logEntries.data.length < 1) {
      return;
    }

    this.filterEntries();
  }

  applyToggleFilter(event: MatSlideToggleChange) {
    let toggle: string = event.source.id;
    this.toggleSettings[toggle] = event.source.checked;

    // Tabelle nur bei vorhandenen Einträgen neu laden
    if (this.logEntries.data.length < 1) {
      return;
    }

    this.filterEntries();
  }

  private filterEntries() {
    this.isProcessing = true;

    // Asynchron laden
    setTimeout(() => {
      this.filteredEntries.data = this.logEntries.data.filter((entry) =>
        this.meetsFilterCriteria(entry)
      );
      this.isProcessing = false;
    }, 0);
  }

  meetsFilterCriteria(entry: Entry): boolean {
    const disabledSettings = Object.keys(this.toggleSettings).filter(
      (toggle) => !this.toggleSettings[toggle]
    );

    // Der Toggle für das Log-Level und die Quelle müssen aktiv sein.
    const levelAndSourceActive =
      !disabledSettings.includes(entry.level) && !disabledSettings.includes(entry.source);

    // Falls ein Suchbegriff eingegeben wurde muss dieser enthalten sein.
    const matchesSearchTerm = entry.containsSearchTerm(this.includeTerm);

    const excludeTerms = this.exludeTerm
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
    this.includeTerm = '';
    this.exludeTerm = '';
    this.toggleSettings = {};
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
}
