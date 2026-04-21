// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'qrcode': 'qr-code-2',
  'qrcode.viewfinder': 'qr-code-scanner',
  'person.circle.fill': 'account-circle',
  'clock.fill': 'access-time',
  'clock': 'access-time',
  'calendar': 'calendar-today',
  'calendar.badge.minus': 'event-busy',
  'hammer.fill': 'build',
  'wrench.and.screwdriver.fill': 'handyman',
  'wrench.and.screwdriver': 'handyman',
  'person.2.fill': 'group',
  'person.3.fill': 'group',
  'checkmark.circle.fill': 'check-circle',
  'checkmark.circle': 'check-circle-outline',
  'checkmark': 'check',
  'info.circle.fill': 'info',
  'lightbulb.fill': 'lightbulb',
  'trash.fill': 'delete',
  'trash': 'delete',
  'minus.circle': 'remove-circle',
  'minus.circle.fill': 'remove-circle',
  'chevron.down': 'keyboard-arrow-down',
  'printer.fill': 'print',
  'square.and.arrow.up.fill': 'share',
  'plus': 'add',
  'hammer': 'build',
  'cube': 'view-in-ar',
  'person.fill': 'person',
  'bell.fill': 'notifications',
  'arrow.up.circle.fill': 'keyboard-arrow-up',
  'arrow.down.circle.fill': 'keyboard-arrow-down',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'plus.circle.fill': 'add-circle',
  'plus.circle': 'add-circle-outline',
  'arrow.right': 'arrow-forward',
  'arrow.down': 'arrow-downward',
  'play.rectangle.fill': 'play-arrow',
  'creditcard.fill': 'credit-card',
  'play.fill': 'play-arrow',
  'magnifyingglass': 'search',
  'banknote': 'attach-money',
  'banknote.fill': 'attach-money',
  'doc': 'description',
  'doc.text.fill': 'description',
  'doc.text.magnifyingglass': 'find-in-page',
  'building.columns': 'business',
  'building.2': 'warehouse',
  'location': 'location-on',
  'map.fill': 'map',
  'map': 'map',
  'pencil': 'edit',
  'phone': 'phone',
  'envelope': 'email',
  'medal': 'emoji-events',
  'cart': 'shopping-cart',
  'person.circle': 'account-circle',
  'lock': 'lock',
  'bell': 'notifications-none',
  'power': 'power-settings-new',
  'eye': 'visibility',
  'door.left.hand.open': 'logout',
  'eye.slash': 'visibility-off',
  'touchid': 'fingerprint',
  'faceid': 'face',
  'flashlight.on.fill': 'flashlight-on',
  'flashlight.off.fill': 'flashlight-off',
  'arrow.clockwise': 'refresh',
  'camera.fill': 'camera',
  'exclamationmark.triangle.fill': 'warning',
  'xmark.circle.fill': 'cancel',
  'xmark': 'close',
  'archivebox': 'archive',
  'arrow.right.circle': 'arrow-circle-right',
  'briefcase': 'work',
  'briefcase.fill': 'work',
  'gearshape': 'settings',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}