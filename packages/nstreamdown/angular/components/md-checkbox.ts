/**
 * MdCheckbox Component
 * Renders a checkbox for GitHub Flavored Markdown task lists
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, input } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';

@Component({
  selector: 'MdCheckbox',
  template: `
    <GridLayout rows="18" columns="18" class="mr-2">
      <Label [text]="checked() ? '☑' : '☐'" [class]="checked() ? 'text-green-600 dark:text-green-400 text-base align-middle' : 'text-slate-400 dark:text-slate-500 text-base align-middle'" [translateY]="isIOS ? 0 : -4"></Label>
    </GridLayout>
  `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdCheckbox {
  checked = input(false);
  isIOS = __APPLE__;
}
