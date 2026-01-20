import { View, Utils } from '@nativescript/core';
import { MenuItem, MenuConfig, MenuResult } from './menu.common';

export { MenuItem, MenuConfig, MenuResult };

/**
 * Shows a native Android popup menu anchored to a view.
 * Uses android.widget.PopupMenu for native Android look and feel.
 */
export function showMenu(anchorView: View, config: MenuConfig): Promise<MenuResult | null> {
  return new Promise((resolve) => {
    Utils.executeOnMainThread(() => {
      const nativeView = anchorView.nativeView as android.view.View;

      if (!nativeView) {
        console.error('No native view available for menu');
        resolve(null);
        return;
      }

      // Get the context
      let context = nativeView.getContext();
      if (!context) {
        console.error('No context available for popup menu');
        resolve(null);
        return;
      }

      // Wrap context with dark theme for dark popup menu styling
      try {
        const darkThemeId = android.R.style.Theme_Material_NoActionBar;
        context = new android.view.ContextThemeWrapper(context, darkThemeId);
      } catch (e) {
        console.warn('Could not apply dark theme to popup menu');
      }

      // Create PopupMenu with gravity to position it correctly
      let popupMenu: android.widget.PopupMenu;
      try {
        const Gravity = android.view.Gravity;
        popupMenu = new android.widget.PopupMenu(context, nativeView, Gravity.END | Gravity.TOP);
      } catch (e) {
        popupMenu = new android.widget.PopupMenu(context, nativeView);
      }

      const menu = popupMenu.getMenu();

      // Add menu items
      config.items.forEach((item, index) => {
        const menuItem = menu.add(android.view.Menu.NONE, index, index, item.title);

        menuItem.setEnabled(!item.disabled);
      });

      // Track if an item was selected
      let itemSelected = false;

      // Set up click listener
      popupMenu.setOnMenuItemClickListener(
        new android.widget.PopupMenu.OnMenuItemClickListener({
          onMenuItemClick: (menuItem: android.view.MenuItem): boolean => {
            itemSelected = true;
            const itemIndex = menuItem.getItemId();
            const selectedItem = config.items[itemIndex];
            if (selectedItem) {
              resolve({
                itemId: selectedItem.id,
                title: selectedItem.title,
              });
            }
            return true;
          },
        }),
      );

      // Set up dismiss listener
      popupMenu.setOnDismissListener(
        new android.widget.PopupMenu.OnDismissListener({
          onDismiss: (): void => {
            if (!itemSelected) {
              resolve(null);
            }
          },
        }),
      );

      // Show the popup menu
      popupMenu.show();
    });
  });
}
