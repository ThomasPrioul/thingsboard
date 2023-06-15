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

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  Injector,
  Input,
  StaticProvider,
  ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MillisecondsToTimeStringPipe } from '@shared/pipe/milliseconds-to-time-string.pipe';
import {
  cloneSelectedTimewindow,
  getTimezoneInfo,
  HistoryWindowType,
  initModelFromDefaultTimewindow,
  QuickTimeIntervalTranslationMap,
  RealtimeWindowType,
  Timewindow,
  TimewindowType
} from '@shared/models/time/time.models';
import { DatePipe } from '@angular/common';
import {
  TIMEWINDOW_PANEL_DATA,
  TimewindowPanelComponent,
  TimewindowPanelData
} from '@shared/components/time/timewindow-panel.component';
import { TimeService } from '@core/services/time.service';
import { TooltipPosition } from '@angular/material/tooltip';
import { deepClone, isDefinedAndNotNull } from '@core/utils';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ConnectedPosition, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { coerceBoolean } from '@shared/decorators/coercion';

// @dynamic
@Component({
  selector: 'tb-timewindow',
  templateUrl: './timewindow.component.html',
  styleUrls: ['./timewindow.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimewindowComponent),
      multi: true
    }
  ]
})
export class TimewindowComponent implements ControlValueAccessor {
  @Input()
  public direction: 'left' | 'right' = 'left';
  @Input()
  public tooltipPosition: TooltipPosition = 'above';
  @Input()
  @coerceBoolean()
  public aggregation = false;
  @Input()
  @coerceBoolean()
  public alwaysDisplayTypePrefix = false;
  @Input()
  @coerceBoolean()
  public asButton = false;
  @Input()
  @coerceBoolean()
  public disabled: boolean;
  @Input()
  @coerceBoolean()
  public displayTimewindowValue = true;
  @Input()
  @coerceBoolean()
  public flatButton = false;
  @Input()
  @coerceBoolean()
  public forAllTimeEnabled = false;
  @Input()
  @coerceBoolean()
  public hideLabel = false;
  @Input()
  @coerceBoolean()
  public isToolbar = false;
  @Input()
  @coerceBoolean()
  public quickIntervalOnly = false;
  @Input()
  @coerceBoolean()
  public strokedButton = false;
  @Input()
  @coerceBoolean()
  public timezone = false;

  public historyOnlyValue = false;
  public innerValue: Timewindow;
  public isEditValue = false;
  public timewindowDisabled: boolean;

  constructor(private overlay: Overlay,
              private translate: TranslateService,
              private timeService: TimeService,
              private millisecondsToTimeStringPipe: MillisecondsToTimeStringPipe,
              private datePipe: DatePipe,
              private cd: ChangeDetectorRef,
              private nativeElement: ElementRef,
              public viewContainerRef: ViewContainerRef) {
  }

  @Input()
  public set historyOnly(val) {
    const newHistoryOnlyValue = coerceBooleanProperty(val);
    if (this.historyOnlyValue !== newHistoryOnlyValue) {
      this.historyOnlyValue = newHistoryOnlyValue;
      if (this.onHistoryOnlyChanged()) {
        this.notifyChanged();
      }
    }
  }

  @Input()
  public set isEdit(val) {
    this.isEditValue = coerceBooleanProperty(val);
    this.timewindowDisabled = this.isTimewindowDisabled();
  }

  public get historyOnly() {
    return this.historyOnlyValue;
  }

  public get isEdit() {
    return this.isEditValue;
  }

  public displayValue(): string {
    return this.displayTimewindowValue ? this.innerValue?.displayValue : this.translate.instant('timewindow.timewindow');
  }

  public notifyChanged() {
    this.propagateChange(cloneSelectedTimewindow(this.innerValue));
  }

  public registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: any): void {
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.timewindowDisabled = this.isTimewindowDisabled();
  }

  public toggleTimewindow($event: Event) {
    if ($event) {
      $event.stopPropagation();
    }
    const config = new OverlayConfig({
      panelClass: 'tb-timewindow-panel',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      maxHeight: '80vh',
      height: 'min-content'
    });
    const connectedPosition: ConnectedPosition = {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top'
    };
    config.positionStrategy = this.overlay.position().flexibleConnectedTo(this.nativeElement)
      .withPositions([connectedPosition]);

    const overlayRef = this.overlay.create(config);
    overlayRef.backdropClick().subscribe(() => {
      overlayRef.dispose();
    });
    const providers: StaticProvider[] = [
      {
        provide: TIMEWINDOW_PANEL_DATA,
        useValue: {
          timewindow: deepClone(this.innerValue),
          historyOnly: this.historyOnly,
          forAllTimeEnabled: this.forAllTimeEnabled,
          quickIntervalOnly: this.quickIntervalOnly,
          aggregation: this.aggregation,
          timezone: this.timezone,
          isEdit: this.isEdit
        } as TimewindowPanelData
      },
      {
        provide: OverlayRef,
        useValue: overlayRef
      }
    ];
    const injector = Injector.create({parent: this.viewContainerRef.injector, providers});
    const componentRef = overlayRef.attach(new ComponentPortal(TimewindowPanelComponent,
      this.viewContainerRef, injector));
    componentRef.onDestroy(() => {
      if (componentRef.instance.result) {
        this.innerValue = componentRef.instance.result;
        this.timewindowDisabled = this.isTimewindowDisabled();
        this.updateDisplayValue();
        this.notifyChanged();
      }
    });
    this.cd.detectChanges();
  }

  public updateDisplayValue() {
    if (this.innerValue.selectedTab === TimewindowType.REALTIME && !this.historyOnly) {
      this.innerValue.displayValue = this.translate.instant('timewindow.realtime') + ' - ';
      if (this.innerValue.realtime.realtimeType === RealtimeWindowType.INTERVAL) {
        this.innerValue.displayValue += this.translate.instant(QuickTimeIntervalTranslationMap.get(this.innerValue.realtime.quickInterval));
      } else {
        this.innerValue.displayValue +=  this.translate.instant('timewindow.last-prefix') + ' ' +
          this.millisecondsToTimeStringPipe.transform(this.innerValue.realtime.timewindowMs);
      }
    } else {
      this.innerValue.displayValue = (!this.historyOnly || this.alwaysDisplayTypePrefix) ?
        (this.translate.instant('timewindow.history') + ' - ') : '';
      if (this.innerValue.history.historyType === HistoryWindowType.LAST_INTERVAL) {
        this.innerValue.displayValue += this.translate.instant('timewindow.last-prefix') + ' ' +
          this.millisecondsToTimeStringPipe.transform(this.innerValue.history.timewindowMs);
      } else if (this.innerValue.history.historyType === HistoryWindowType.INTERVAL) {
        this.innerValue.displayValue += this.translate.instant(QuickTimeIntervalTranslationMap.get(this.innerValue.history.quickInterval));
      } else if (this.innerValue.history.historyType === HistoryWindowType.FOR_ALL_TIME) {
        this.innerValue.displayValue += this.translate.instant('timewindow.for-all-time');
      } else {
        const startString = this.datePipe.transform(this.innerValue.history.fixedTimewindow.startTimeMs, 'yyyy-MM-dd HH:mm:ss');
        const endString = this.datePipe.transform(this.innerValue.history.fixedTimewindow.endTimeMs, 'yyyy-MM-dd HH:mm:ss');
        this.innerValue.displayValue += this.translate.instant('timewindow.period', {startTime: startString, endTime: endString});
      }
    }
    if (isDefinedAndNotNull(this.innerValue.timezone) && this.innerValue.timezone !== '') {
      this.innerValue.displayValue += ' ';
      this.innerValue.displayTimezoneAbbr = getTimezoneInfo(this.innerValue.timezone).abbr;
    } else {
      this.innerValue.displayTimezoneAbbr = '';
    }
    this.cd.detectChanges();
  }

  public writeValue(obj: Timewindow): void {
    this.innerValue = initModelFromDefaultTimewindow(obj, this.quickIntervalOnly, this.historyOnly, this.timeService);
    this.timewindowDisabled = this.isTimewindowDisabled();
    if (this.onHistoryOnlyChanged()) {
      setTimeout(() => {
        this.notifyChanged();
      });
    } else {
      this.updateDisplayValue();
    }
  }

  private isTimewindowDisabled(): boolean {
    return this.disabled ||
      (!this.isEdit && (!this.innerValue || this.innerValue.hideInterval &&
        (!this.aggregation || this.innerValue.hideAggregation && this.innerValue.hideAggInterval)));
  }

  private onHistoryOnlyChanged(): boolean {
    if (this.historyOnlyValue && this.innerValue && this.innerValue.selectedTab !== TimewindowType.HISTORY) {
      this.innerValue.selectedTab = TimewindowType.HISTORY;
      this.updateDisplayValue();
      return true;
    }
    return false;
  }

  private propagateChange = (_: any) => {};
}
