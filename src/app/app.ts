import { Component, signal, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    DatePipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected readonly title = signal('angular-log-analyzer');
  displayedColumns: string[] = ['date', 'time', 'level', 'source', 'message'];
  logEntries = new MatTableDataSource<any>([]);
  @ViewChild(MatSort) sort!: MatSort;

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
    console.log(`📄 Anzahl Zeilen: ${lines.length}`);

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

        parsedLogs.push(logEntry);
      }
    }

    // Tabelle aktualisieren
    if (parsedLogs.length > 0) {
      this.logEntries.data = parsedLogs;
    } else {
      console.log('⚠️ Keine Log-Einträge gefunden.'); // TOOD: Snackbar anzeigen.
    }
  }

  ngAfterViewInit() {
    this.logEntries.sort = this.sort;
  }
}
