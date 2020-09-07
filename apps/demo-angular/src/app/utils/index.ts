/**
 * Demo Menu Utilities
 *
 * Provides native platform menus for iOS and Android.
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
