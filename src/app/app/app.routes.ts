import { Routes } from '@angular/router';

import { gameOngoingGuard } from '../guards/gameOngoing.guard';

import { MainMenu } from '../webpages/mainMenu/mainMenu';
import { GameScreen } from '../webpages/gameScreen/gameScreen';
import { PageNotFound } from '../webpages/pageNotFound/pageNotFound';

export const routes: Routes = [
  {
    path: '',
    title: 'Reversi: Main Menu',
    component: MainMenu,
  },
  {
    path: 'board',
    title: 'Reversi: Board',
    component: GameScreen,
    canActivate: [ gameOngoingGuard ],
  },
  {
    path: '**',
    title: '404 Page not found',
    component: PageNotFound,
  },
];
