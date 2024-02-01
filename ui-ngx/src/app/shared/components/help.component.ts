///
/// Copyright © 2016-2023 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { Component, Input } from '@angular/core';
import { AppState, getCurrentAuthState } from '@app/core/public-api';
import { HelpLinks } from '@shared/models/constants';
import { Authority } from '../public-api';
import { Store } from '@ngrx/store';

@Component({
  selector: '[tb-help]',
  templateUrl: './help.component.html'
})
export class HelpComponent {
  show: boolean;

  constructor(store: Store<AppState>) {
    this.show = getCurrentAuthState(store).authUser.authority === Authority.TENANT_ADMIN;
  }

  @Input('tb-help') helpLinkId: string;

  gotoHelpPage(): void {
    let helpUrl = HelpLinks.linksMap[this.helpLinkId];
    if (!helpUrl && this.helpLinkId &&
      (this.helpLinkId.startsWith('http://') || this.helpLinkId.startsWith('https://'))) {
      helpUrl = this.helpLinkId;
    }
    if (helpUrl) {
      window.open(helpUrl, '_blank');
    }
  }

}
