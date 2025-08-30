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
import { DatePipe } from '@angular/common';

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
    DatePipe,
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
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      date: '2025-08-30',
      time: '10:46:02',
      level: 'WARNING',
      source: 'FW',
      message: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'VERBOSE',
      source: 'CAD',
      message: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'INFO',
      source: 'CAD',
      message: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'WARNING',
      source: 'CAD',
      message: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'VERBOSE',
      source: 'CAD',
      message: 'Et harum quidem rerum facilis est et expedita distinctio.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'INFO',
      source: 'CAD',
      message: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'WARNING',
      source: 'CAD',
      message: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.',
    },
       {
      date: '2025-08-30',
      time: '10:47:33',
      level: 'ERROR',
      source: 'CAD',
      message: 'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis.',
    },
  ];
}
