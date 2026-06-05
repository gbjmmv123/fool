<script setup lang="ts">
const reducedMotion = useReducedMotion()
</script>

<template>
  <div class="fog-wrap" aria-hidden="true">

    <!-- Layer 1: large-scale base fog, slowest drift -->
    <svg class="fog-layer fog-layer--1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <filter id="fog-f1" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.005" numOctaves="4" seed="2">
            <animate
              v-if="!reducedMotion"
              attributeName="baseFrequency"
              dur="48s"
              values="0.009 0.005; 0.007 0.004; 0.011 0.006; 0.009 0.005"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.24
                    0 0 0 0 0.22
                    0 0 0 0 0.20
                    0 0 0 4.5 -1.8"
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#fog-f1)" />
    </svg>

    <!-- Layer 2: medium-scale mid fog, counter-drift -->
    <svg class="fog-layer fog-layer--2" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <filter id="fog-f2" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.010" numOctaves="5" seed="9">
            <animate
              v-if="!reducedMotion"
              attributeName="baseFrequency"
              dur="31s"
              values="0.018 0.010; 0.014 0.008; 0.022 0.012; 0.018 0.010"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.21
                    0 0 0 0 0.19
                    0 0 0 0 0.17
                    0 0 0 3.8 -1.4"
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#fog-f2)" />
    </svg>

    <!-- Layer 3: fine wisp layer, fastest drift -->
    <svg class="fog-layer fog-layer--3" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <filter id="fog-f3" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.034 0.017" numOctaves="6" seed="17">
            <animate
              v-if="!reducedMotion"
              attributeName="baseFrequency"
              dur="21s"
              values="0.034 0.017; 0.028 0.014; 0.038 0.019; 0.034 0.017"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.28
                    0 0 0 0 0.26
                    0 0 0 0 0.24
                    0 0 0 3.0 -1.0"
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#fog-f3)" />
    </svg>

  </div>
</template>

<style scoped>
/* Container: vertical fade mask + clip context */
.fog-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 33.33%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
  mask-image: linear-gradient(
    to top,
    black        0%,
    black        10%,
    rgba(0,0,0,0.94) 25%,
    rgba(0,0,0,0.60) 55%,
    rgba(0,0,0,0.14) 82%,
    transparent  100%
  );
  -webkit-mask-image: linear-gradient(
    to top,
    black        0%,
    black        10%,
    rgba(0,0,0,0.94) 25%,
    rgba(0,0,0,0.60) 55%,
    rgba(0,0,0,0.14) 82%,
    transparent  100%
  );
}

/* Each layer is wider than the container so horizontal drift never shows an edge */
.fog-layer {
  position: absolute;
  top: 0;
  left: -6%;
  width: 112%;
  height: 100%;
  display: block;
}

/* Layer 1 — dense base, very slow sway */
.fog-layer--1 {
  opacity: 0.92;
  animation: fog-drift-1 58s ease-in-out infinite;
}

/* Layer 2 — mid, drifts opposite direction */
.fog-layer--2 {
  opacity: 0.70;
  animation: fog-drift-2 40s ease-in-out infinite;
  animation-delay: -15s;
}

/* Layer 3 — fine wisps, fastest, slightly lighter */
.fog-layer--3 {
  opacity: 0.50;
  animation: fog-drift-3 26s ease-in-out infinite;
  animation-delay: -8s;
}

@keyframes fog-drift-1 {
  0%   { transform: translateX(0%); }
  28%  { transform: translateX(-3.5%); }
  62%  { transform: translateX(2.8%); }
  100% { transform: translateX(0%); }
}

@keyframes fog-drift-2 {
  0%   { transform: translateX(0%); }
  38%  { transform: translateX(4.2%); }
  70%  { transform: translateX(-3.0%); }
  100% { transform: translateX(0%); }
}

@keyframes fog-drift-3 {
  0%   { transform: translateX(0%); }
  42%  { transform: translateX(-5.0%); }
  78%  { transform: translateX(3.5%); }
  100% { transform: translateX(0%); }
}

@media (prefers-reduced-motion: reduce) {
  .fog-layer { animation: none; }
}
</style>
