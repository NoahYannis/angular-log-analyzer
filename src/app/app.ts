import { Component, signal, ViewChild, AfterViewInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  MatSlideToggle,
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
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
import { filter } from 'rxjs';

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
    DatePipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected readonly title = signal('angular-log-analyzer');
  displayedColumns: string[] = ['date', 'time', 'level', 'source', 'message'];

  logEntries = new MatTableDataSource<any>([]);
  filteredEntries = new MatTableDataSource<any>([]);

  snackBar: MatSnackBar = inject(MatSnackBar);
  @ViewChild(MatSort) sort!: MatSort;

  private filterSettings: { [level: string]: boolean } = {};

  readLogFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.log';
    input.style.display = 'none';

    input.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          this.parseLogContent(content);
        };
        reader.readAsText(file);
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  parseLogContent(content: string) {
    // Datei in Zeilen aufteilen
    const lines = content.split('\n');
    const parsedLogs = [];

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

      if (match) {
        const logEntry = {
          date: match[1], // Datum
          time: match[2], // Uhrzeit
          level: match[3], // Level
          source: match[4], // Anwendung
          message: match[5].trim(), // Inhalt
        };

        // TODO: Nur hinzufügen, falls Filter passt.

        parsedLogs.push(logEntry);
      }
    }

    // Tabelle aktualisieren
    if (parsedLogs.length > 0) {
      this.logEntries.data = parsedLogs;
      return;
    }

    this.snackBar.open('Keine Log-Einträge gefunden :/', 'OK', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-bottom-margin'],
    });
  }

  applyFilter(event: MatSlideToggleChange) {
    let level: string = event.source.id;
    this.filterSettings[level] = event.source.checked;

    if (this.logEntries.data.length < 1) {
      return;
    }

    const disabledLevels = Object.keys(this.filterSettings).filter(
      (level) => !this.filterSettings[level]
    );

    this.logEntries.data = this.logEntries.data.filter(
      (entry: any) => !disabledLevels.includes(entry.level)
    );
  }

  ngAfterViewInit() {
    this.logEntries.sort = this.sort;
  }
}
