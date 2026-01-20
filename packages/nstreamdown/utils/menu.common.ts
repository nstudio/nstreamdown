import { Utils, View, Dialogs } from '@nativescript/core';

/**
 * Menu item configuration
 */
export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  destructive?: boolean;
  disabled?: boolean;
}

/**
 * Menu configuration
 */
export interface MenuConfig {
  title?: string;
  items: MenuItem[];
}

/**
 * Menu result returned when an item is selected
 */
export interface MenuResult {
  itemId: string;
  title: string;
}

/**
 * Fallback showMenu implementation using Dialogs.action
 * This is used when platform-specific implementations aren't available
 */
export async function showMenu(anchorView: View, config: MenuConfig): Promise<MenuResult | null> {
  const actions = config.items.filter((item) => !item.disabled).map((item) => item.title);

  const result = await Dialogs.action({
    title: config.title || 'Menu',
    actions: actions,
    cancelButtonText: 'Cancel',
  });

  if (result && result !== 'Cancel') {
    const selectedItem = config.items.find((item) => item.title === result);
    if (selectedItem) {
      return { itemId: selectedItem.id, title: selectedItem.title };
    }
  }

  return null;
}
