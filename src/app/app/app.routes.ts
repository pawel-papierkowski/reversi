import { Routes } from '@angular/router';

import { gameOngoingGuard } from '../guards/gameOngoing.guard';

import { MainMenuPage } from '../webpages/mainMenu/mainMenu';
import { GameScreenPage } from '../webpages/gameScreen/gameScreen';
import { PageNotFoundPage } from '../webpages/pageNotFound/pageNotFound';

export const routes: Routes = [
  {
    path: '',
    title: 'Reversi: Main Menu',
    component: MainMenuPage,
  },
  {
    path: 'board',
    title: 'Reversi: Board',
    component: GameScreenPage,
    canActivate: [ gameOngoingGuard ],
  },
  {
    path: '**',
    title: '404 Page not found',
    component: PageNotFoundPage,
  },
];
