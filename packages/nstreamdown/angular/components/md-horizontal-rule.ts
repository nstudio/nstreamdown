/**
 * MdHorizontalRule Component
 * Renders a horizontal divider line
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';

@Component({
  selector: 'MdHorizontalRule',
  template: ` <StackLayout class="my-4 h-px bg-gray-300 dark:bg-gray-600"></StackLayout> `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdHorizontalRule {}
