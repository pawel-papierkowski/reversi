import { Component } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

import { projectProp } from "@/code/data/gameConst";

@Component({
  selector: 'app-footer',
  imports: [ TranslatePipe ],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterCmp {
  projectProp = projectProp;
}
