/**
 * MdHorizontalRule Component
 * Renders a horizontal divider line
 */
import { Component, NO_ERRORS_SCHEMA, ChangeDetectionStrategy, input } from '@angular/core';
import { NativeScriptCommonModule } from '@nativescript/angular';
import type { StyleSpacing } from './streamdown';

@Component({
  selector: 'MdHorizontalRule',
  template: ` <StackLayout [class]="'h-px bg-gray-300 dark:bg-gray-600 ' + (styleSpacing().horizontalRule || 'my-4')"></StackLayout> `,
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdHorizontalRule {
  styleSpacing = input<StyleSpacing>({ paragraph: null, heading: null, list: null, blockquote: null, codeBlock: null, image: null, horizontalRule: null, table: null, mathBlock: null });
}
