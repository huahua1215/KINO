<template>
  <svg
    width="28"
    height="28"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="brand-logo"
  >
    <!-- Film frame -->
    <rect x="5" y="3" width="22" height="26" rx="1.5"
          stroke="white" stroke-width="1.3" opacity="0.9"/>

    <!-- Sprocket holes — left -->
    <rect x="2" y="7.5"  width="2.2" height="3.2" rx="0.5" fill="white" opacity="0.55"/>
    <rect x="2" y="14.4" width="2.2" height="3.2" rx="0.5" fill="white" opacity="0.55"/>
    <rect x="2" y="21.3" width="2.2" height="3.2" rx="0.5" fill="white" opacity="0.55"/>

    <!-- Sprocket holes — right -->
    <rect x="27.8" y="7.5"  width="2.2" height="3.2" rx="0.5" fill="white" opacity="0.55"/>
    <rect x="27.8" y="14.4" width="2.2" height="3.2" rx="0.5" fill="white" opacity="0.55"/>
    <rect x="27.8" y="21.3" width="2.2" height="3.2" rx="0.5" fill="white" opacity="0.55"/>

    <!-- Inner frame line — suggests the image area -->
    <rect x="8.5" y="7" width="15" height="18" rx="0.8"
          stroke="white" stroke-width="0.7" opacity="0.3"/>
  </svg>
</template>

<style scoped>
.brand-logo {
  flex-shrink: 0;
  display: block;
}
</style>
