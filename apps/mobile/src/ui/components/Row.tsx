import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

export interface RowProps {
  children: ReactNode;
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: ViewStyle['justifyContent'];
  style?: ViewStyle;
  wrap?: boolean;
}

export function Row({ children, gap = 8, align = 'center', justify, wrap, style }: RowProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
