import { defineConfig, presetAttributify, presetIcons, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  // UnoCSS presets: utility + attributify + icons
  presets: [presetWind3(), presetAttributify(), presetIcons()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  // Semantic shortcuts based on CSS variables in `styles/vars.css`
  shortcuts: {
    // Text
    'text-primary': 'text-[color:var(--dt-text-title)]',
    'text-secondary': 'text-[color:var(--dt-text-heading)]',
    'text-body': 'text-[color:var(--dt-text-body)]',
    'text-muted': 'text-[color:var(--dt-text-muted)]',
    'text-on-accent': 'text-[color:var(--dt-text-on-gold)]',

    // Background
    'bg-canvas': 'bg-[color:var(--dt-bg-base)]',
    'bg-surface': 'bg-[color:var(--dt-bg-elevated)]',
    'bg-surface-hover': 'bg-[color:var(--dt-bg-hover)]',

    // Border color
    'border-default': 'border-[color:var(--dt-border-default)]',
    'border-strong': 'border-[color:var(--dt-border-active)]',
    'border-highlight': 'border-[color:var(--dt-border-highlight)]',
    'border-disabled': 'border-[color:var(--dt-border-disabled)]',
    'border-subtle': 'border-[color:var(--dt-border-subtle)]',

    // State
    'state-danger': 'text-[color:var(--dt-state-danger)]',
    'state-success': 'text-[color:var(--dt-state-success)]',
  },
  theme: {
    // Design Token - Shape
    borderRadius: {
      card: 'var(--dt-radius-card)',
    },
    // Design Token - Shadow
    boxShadow: {
      card: 'var(--dt-shadow-card)',
    },
  },
})
