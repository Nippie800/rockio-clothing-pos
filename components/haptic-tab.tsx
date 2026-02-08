// components/haptic-tab.tsx
import React from 'react';
import { Pressable } from 'react-native';

type HapticTabProps = any;

/**
 * Simple wrapper for a tab button.
 * Right now it just behaves like a normal Pressable.
 * (We can add actual haptics later if needed.)
 */
export function HapticTab(props: HapticTabProps) {
  return <Pressable {...props} />;
}
