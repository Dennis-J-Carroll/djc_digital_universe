Using Node.js >=22.12.0, Tailwind CSS v3.4.19, and Vite v7.2.4

Tailwind CSS has been set up with the shadcn theme

Setup complete: apps/calculus-flow/

Components (40+):
  accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb,
  button-group, button, calendar, card, carousel, chart, checkbox, collapsible,
  command, context-menu, dialog, drawer, dropdown-menu, empty, field, form,
  hover-card, input-group, input-otp, input, item, kbd, label, menubar,
  navigation-menu, pagination, popover, progress, radio-group, resizable,
  scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner,
  spinner, switch, table, tabs, textarea, toggle-group, toggle, tooltip

Usage:
  import { Button } from '@/components/ui/button'
  import { Card, CardHeader, CardTitle } from '@/components/ui/card'

Structure:
  src/components/      Calculus Flow interface and reusable UI components
  src/components/ui/   Shared shadcn-style UI primitives
  src/hooks/           Canvas and responsive-layout hooks
  src/lib/             Calculus functions, rendering, and derivative parsing
  src/App.tsx          Root React component and application state
  src/index.css        Global and application styles
  src/main.tsx         React entry point
  tests/               Node-based derivative parser tests
  index.html           Vite HTML entry point
  tailwind.config.js   Tailwind theme and plugin configuration
  vite.config.ts       Vite build and development-server settings
  postcss.config.js    CSS post-processing configuration
