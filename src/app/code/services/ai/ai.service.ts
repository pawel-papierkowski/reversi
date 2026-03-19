import { Injectable, inject } from '@angular/core';

import { MiniMaxService } from '@/code/services/ai/miniMax.service';

/**
 * Handling AI for Reversi.
 */
@Injectable({providedIn: 'root'})
export class AiService {
  private readonly miniMaxService = inject(MiniMaxService);

}
