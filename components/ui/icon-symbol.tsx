import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "book.fill": "menu-book",
  "arrow.clockwise": "replay",
  "mic.fill": "mic",
  "chart.bar.fill": "bar-chart",
  "person.fill": "person",
  "gearshape.fill": "settings",
  // Actions
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  "xmark": "close",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "plus": "add",
  "minus": "remove",
  "star.fill": "star",
  "star": "star-border",
  "heart.fill": "favorite",
  "heart": "favorite-border",
  // Media
  "speaker.wave.2.fill": "volume-up",
  "speaker.slash.fill": "volume-off",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "mic.slash.fill": "mic-off",
  // Learning
  "graduationcap.fill": "school",
  "pencil": "edit",
  "doc.text.fill": "description",
  "lightbulb.fill": "lightbulb",
  "flame.fill": "local-fire-department",
  "trophy.fill": "emoji-events",
  "clock.fill": "access-time",
  "calendar": "calendar-today",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "repeat": "repeat",
  "shuffle": "shuffle",
  "info.circle": "info",
  "questionmark.circle": "help",
  "exclamationmark.circle": "error",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
  "eye.fill": "visibility",
  "eye.slash.fill": "visibility-off",
} as IconMapping;

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
