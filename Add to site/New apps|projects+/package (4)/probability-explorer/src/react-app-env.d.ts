/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'recharts' {
  import * as React from 'react';

  export interface TooltipProps<TValue, TName> {
    content?: React.ReactElement | ((props: TooltipContentProps<TValue, TName>) => React.ReactElement) | null;
    separator?: string;
    wrapper?: React.ReactElement;
    cursor?: React.ReactElement | boolean;
    viewBox?: { x?: number; y?: number; width?: number; height?: number };
    coordinate?: { x?: number; y?: number };
    active?: boolean;
    payload?: Array<PayloadValue<TValue, TName>>;
    label?: string | number;
    labelFormatter?: (label: string | number) => React.ReactNode;
    formatter?: Formatter<TValue, TName>;
    itemSorter?: (a: PayloadValue<TValue, TName>, b: PayloadValue<TValue, TName>) => number;
    itemFormatter?: (value: TValue, name: TName, item: PayloadValue<TValue, TName>, index: number) => React.ReactNode;
    position?: { x?: number; y?: number };
    activeIndex?: number;
  }

  export interface TooltipContentProps<TValue, TName> {
    active?: boolean;
    payload?: Array<PayloadValue<TValue, TName>>;
    label?: string | number;
    formatter?: Formatter<TValue, TName>;
    itemSorter?: (a: PayloadValue<TValue, TName>, b: PayloadValue<TValue, TName>) => number;
    separator?: string;
    contentStyle?: React.CSSProperties;
    itemStyle?: React.CSSProperties;
    labelStyle?: React.CSSProperties;
    labelFormatter?: (label: string | number) => React.ReactNode;
    wrapper?: React.ReactElement;
  }

  export interface PayloadValue<TValue, TName> {
    value?: TValue;
    name?: TName;
    dataKey?: string | number;
    color?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    payload?: any;
  }

  export type Formatter<TValue, TName> = (value: TValue, name: TName, item: PayloadValue<TValue, TName>, index: number, payload?: any) => [React.ReactNode, TName] | React.ReactNode;

  export class XAxis extends React.Component<any> {}
  export class YAxis extends React.Component<any> {}
  export class Tooltip<TValue = any, TName = any> extends React.Component<TooltipProps<TValue, TName>> {}
  export class Bar extends React.Component<any> {}
  export class BarChart extends React.Component<any> {}
  export class PieChart extends React.Component<any> {}
  export class Pie extends React.Component<any> {}
  export class Cell extends React.Component<any> {}
  export class ResponsiveContainer extends React.Component<any> {}
  export class Legend extends React.Component<any> {}
  export class Line extends React.Component<any> {}
  export class LineChart extends React.Component<any> {}
  export class Area extends React.Component<any> {}
  export class AreaChart extends React.Component<any> {}
  export class Radar extends React.Component<any> {}
  export class RadarChart extends React.Component<any> {}
  export class RadialBar extends React.Component<any> {}
  export class RadialBarChart extends React.Component<any> {}
  export class Scatter extends React.Component<any> {}
  export class ScatterChart extends React.Component<any> {}
  export class Treemap extends React.Component<any> {}
  export class Funnel extends React.Component<any> {}
  export class FunnelChart extends React.Component<any> {}
  export class Sankey extends React.Component<any> {}
  export class G extends React.Component<any> {}
}
