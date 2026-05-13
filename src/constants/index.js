// Navigation links configuration
export const NAV_LINKS = [
  { id: "home", label: "Home", path: "/" },
  { id: "apps", label: "Apps & Projects", path: "/apps" },
  { id: "stories", label: "Stories & More", path: "/stories" },
  { id: "about", label: "About", path: "/about" },
  { id: "contact", label: "Contact", path: "/contact" }
];

// Social media links configuration
export const SOCIAL_LINKS = [
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/Dennis-J-Carroll',
    ariaLabel: "Visit Dennis J. Carroll's GitHub profile",
    icon: '→' // Placeholder, actual SVG icons used in components
  },
  {
    id: 'twitter',
    name: 'Twitter',
    url: 'https://x.com/denniscarrollj',
    ariaLabel: 'Follow Dennis J. Carroll on X (Twitter)',
    icon: '→'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/dennisjcarroll/',
    ariaLabel: "Connect with Dennis J. Carroll on LinkedIn",
    icon: '→'
  }
];

// Theme configuration
export const THEMES = [
  { id: 'dark', name: 'Dark', icon: '◐', ariaLabel: 'Switch to Dark theme' },
  { id: 'light', name: 'Light', icon: '○', ariaLabel: 'Switch to Light theme' },
  { id: 'tokyo-afternoon', name: 'Tokyo', icon: '◑', ariaLabel: 'Switch to Tokyo Afternoon theme' },
  { id: 'retro-80s', name: '80s Retro', icon: '◈', ariaLabel: 'Switch to 80s Retro theme' }
];

// Site metadata constants
export const SITE_CONFIG = {
  title: 'Dennis J. Carroll',
  description: 'Data Scientist & Developer specializing in AI, machine learning, and web development',
  author: '@denniscarrollj',
  siteUrl: 'https://denniscarroll.com'
};

// Quick links for footer
export const QUICK_LINKS = [
  { label: "Home", url: "/" },
  { label: "Apps & Projects", url: "/apps" },
  { label: "Creative Writing", url: "/stories" },
  { label: "About", url: "/about" },
  { label: "Contact", url: "/contact" }
];
