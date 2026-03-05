import { Routes } from '@angular/router';

import { MainMenu } from './webpages/mainMenu/mainMenu';
import { GameBoard } from './webpages/gameBoard/gameBoard';
import { PageNotFound } from './webpages/pageNotFound/pageNotFound';

export const routes: Routes = [
  {
    path: '',
    title: 'Main Menu',
    component: MainMenu,
  },
  {
    path: 'board',
    title: 'Game Board',
    component: GameBoard,
  },
  {
    path: '**',
    title: '404 Page not found',
    component: PageNotFound,
  },
];
