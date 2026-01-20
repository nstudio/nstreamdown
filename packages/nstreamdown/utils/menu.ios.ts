import { View, Utils } from '@nativescript/core';
import type { MenuItem, MenuConfig, MenuResult } from './menu.common';

export type { MenuItem, MenuConfig, MenuResult };

// Store references for cleanup and callbacks
const menuButtonMap = new WeakMap<UIView, UIButton>();
const pendingResolvers = new Map<string, (result: MenuResult | null) => void>();
let menuCounter = 0;

/**
 * Creates and attaches a native iOS dropdown menu to a view.
 * Uses UIButton with showsMenuAsPrimaryAction for iOS 14+ to show
 * a native pull-down menu that appears directly from the button.
 */
export function showMenu(anchorView: View, config: MenuConfig): Promise<MenuResult | null> {
  return new Promise((resolve) => {
    Utils.executeOnMainThread(() => {
      const nativeView = anchorView.nativeView as UIView;

      if (!nativeView) {
        console.error('No native view available for menu');
        resolve(null);
        return;
      }

      if (Utils.SDK_VERSION >= 14) {
        showNativeDropdownMenu(nativeView, config, resolve);
      } else {
        showActionSheetFallback(nativeView, config, resolve);
      }
    });
  });
}

/**
 * Shows native iOS 14+ dropdown menu using UIContextMenuInteraction
 */
function showNativeDropdownMenu(anchorView: UIView, config: MenuConfig, resolve: (result: MenuResult | null) => void): void {
  const menuId = `menu_${++menuCounter}`;
  pendingResolvers.set(menuId, resolve);

  // Clean up any existing menu button
  const existingButton = menuButtonMap.get(anchorView);
  if (existingButton) {
    existingButton.removeFromSuperview();
  }

  // Build menu actions
  const actions = NSMutableArray.alloc<UIMenuElement>().init();

  for (const item of config.items) {
    const itemId = item.id;
    const itemTitle = item.title;
    const currentMenuId = menuId;

    // Create UIImage for SF Symbol icon
    let image: UIImage | null = null;
    if (item.icon) {
      image = UIImage.systemImageNamed(item.icon);
    }

    // Create action with handler
    const action = UIAction.actionWithTitleImageIdentifierHandler(item.title, image, item.id, () => {
      // Clean up button
      const btn = menuButtonMap.get(anchorView);
      if (btn) {
        btn.removeFromSuperview();
        menuButtonMap.delete(anchorView);
      }

      // Resolve with selection
      const resolver = pendingResolvers.get(currentMenuId);
      if (resolver) {
        pendingResolvers.delete(currentMenuId);
        resolver({ itemId, title: itemTitle });
      }
    });

    // Set attributes
    if (item.destructive) {
      action.attributes = UIMenuElementAttributes.Destructive;
    }
    if (item.disabled) {
      action.attributes = action.attributes | UIMenuElementAttributes.Disabled;
    }

    actions.addObject(action);
  }

  // Create the menu
  const menu = UIMenu.menuWithTitleImageIdentifierOptionsChildren(config.title || '', null, menuId, 0 as UIMenuOptions, actions as unknown as NSArray<UIMenuElement>);

  // Create transparent button overlay
  const button = UIButton.buttonWithType(UIButtonType.System);
  button.frame = CGRectMake(0, 0, anchorView.bounds.size.width, anchorView.bounds.size.height);
  button.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
  button.backgroundColor = UIColor.clearColor;
  button.setTitleForState('', UIControlState.Normal);

  // Attach menu to button
  button.menu = menu;
  button.showsMenuAsPrimaryAction = true;

  // Store reference for cleanup
  menuButtonMap.set(anchorView, button);

  // Add button to anchor view
  anchorView.addSubview(button);

  // Handle menu dismissal
  const checkDismissal = () => {
    setTimeout(() => {
      const btn = menuButtonMap.get(anchorView);
      if (btn && btn.superview) {
        if (!pendingResolvers.has(menuId)) {
          btn.removeFromSuperview();
          menuButtonMap.delete(anchorView);
        } else {
          checkDismissal();
        }
      } else if (pendingResolvers.has(menuId)) {
        const resolver = pendingResolvers.get(menuId);
        pendingResolvers.delete(menuId);
        if (resolver) resolver(null);
      }
    }, 300);
  };

  setTimeout(checkDismissal, 500);

  // Timeout safety net
  setTimeout(() => {
    if (pendingResolvers.has(menuId)) {
      const resolver = pendingResolvers.get(menuId);
      pendingResolvers.delete(menuId);
      const btn = menuButtonMap.get(anchorView);
      if (btn) {
        btn.removeFromSuperview();
        menuButtonMap.delete(anchorView);
      }
      if (resolver) resolver(null);
    }
  }, 60000);
}

/**
 * Fallback for iOS < 14 using UIAlertController action sheet
 */
function showActionSheetFallback(anchorView: UIView, config: MenuConfig, resolve: (result: MenuResult | null) => void): void {
  const alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(config.title || null, null, UIAlertControllerStyle.ActionSheet);

  for (const item of config.items) {
    const style = item.destructive ? UIAlertActionStyle.Destructive : UIAlertActionStyle.Default;

    const action = UIAlertAction.actionWithTitleStyleHandler(item.title, style, () => {
      resolve({ itemId: item.id, title: item.title });
    });

    if (item.disabled) {
      action.enabled = false;
    }

    alertController.addAction(action);
  }

  const cancelAction = UIAlertAction.actionWithTitleStyleHandler('Cancel', UIAlertActionStyle.Cancel, () => resolve(null));
  alertController.addAction(cancelAction);

  const popover = alertController.popoverPresentationController;
  if (popover) {
    popover.sourceView = anchorView;
    popover.sourceRect = anchorView.bounds;
    popover.permittedArrowDirections = UIPopoverArrowDirection.Any;
  }

  const viewController = getTopViewController();
  if (viewController) {
    viewController.presentViewControllerAnimatedCompletion(alertController, true, null);
  } else {
    resolve(null);
  }
}

function getTopViewController(): UIViewController | null {
  let viewController: UIViewController | null = null;
  const scenes = UIApplication.sharedApplication.connectedScenes;
  const sceneArray = scenes.allObjects;

  for (let i = 0; i < sceneArray.count; i++) {
    const scene = sceneArray.objectAtIndex(i);
    if (scene instanceof UIWindowScene) {
      const windows = (scene as UIWindowScene).windows;
      for (let j = 0; j < windows.count; j++) {
        const window = windows.objectAtIndex(j);
        if (window.isKeyWindow) {
          viewController = window.rootViewController;
          break;
        }
      }
    }
    if (viewController) break;
  }

  while (viewController?.presentedViewController) {
    viewController = viewController.presentedViewController;
  }

  return viewController;
}
