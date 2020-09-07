/**
 * Native Menu Module
 *
 * Provides native platform menus for iOS and Android.
 * - iOS: Uses UIButton with UIMenu for native dropdown menus
 * - Android: Uses android.widget.PopupMenu for native popup menus
 *
 * Usage:
 * ```typescript
 * import { showMenu, MenuConfig } from './components/menu';
 *
 * const config: MenuConfig = {
 *   title: 'Options',
 *   items: [
 *     { id: 'code', title: 'Show Code', icon: 'doc.text' },
 *     { id: 'table', title: 'Show Table', icon: 'tablecells' },
 *     { id: 'math', title: 'Show Math', icon: 'function' },
 *   ]
 * };
 *
 * const result = await showMenu(buttonView, config);
 * if (result) {
 *   console.log('Selected:', result.itemId);
 * }
 * ```
 */

export type { MenuItem, MenuConfig, MenuResult } from './menu.common';
import { showMenu as platformShowMenu } from './menu';

import { View } from '@nativescript/core';
import { MenuConfig as MenuConfigType, MenuResult as MenuResultType } from './menu.common';

/**
 * Shows a native platform menu anchored to the given view.
 * On iOS, uses UIMenu with UIButton for native dropdown appearance.
 * On Android, uses PopupMenu for native popup appearance.
 */
export function showMenu(anchorView: View, config: MenuConfigType): Promise<MenuResultType | null> {
  return platformShowMenu(anchorView, config);
}
