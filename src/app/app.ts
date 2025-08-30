import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

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
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})


export class App {
  protected readonly title = signal('angular-log-analyzer');

  displayedColumns: string[] = ['date', 'time', 'level', 'source', 'message'];
  dataSource = [
    {
      date: '2025-08-30',
      time: '10:45:12',
      level: 'INFO',
      source: 'DAL',
      message: 'Benutzer hat sich erfolgreich angemeldet.',
    },
    {
      date: '2025-08-30',
      time: '10:46:02',
      level: 'WARNING',
      source: 'FW',
      message: 'Hohe CPU-Auslastung erkannt: 92%',
    },
    {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Verbindung zur Datenbank fehlgeschlagen.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Verbindung zur Datenbank fehlgeschlagen.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Verbindung zur Datenbank fehlgeschlagen.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Verbindung zur Datenbank fehlgeschlagen.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Verbindung zur Datenbank fehlgeschlagen.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Verbindung zur Datenbank fehlgeschlagen.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Verbindung zur Datenbank fehlgeschlagen.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Verbindung zur Datenbank fehlgeschlagen.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Verbindung zur Datenbank fehlgeschlagen.',
    },
  ];
}
