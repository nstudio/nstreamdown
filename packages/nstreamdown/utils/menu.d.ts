import { View } from '@nativescript/core';
import { MenuConfig, MenuResult } from './menu.common';

export function showMenu(anchorView: View, config: MenuConfig): Promise<MenuResult | null>;
