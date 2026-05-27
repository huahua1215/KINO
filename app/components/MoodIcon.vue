<script setup lang="ts">
import type { MoodKey } from '~/types/movie'

defineProps<{
  mood: MoodKey
  size?: number
}>()
</script>

<template>
  <svg
    :width="size ?? 80"
    :height="size ?? 80"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="mood-icon"
  >
    <defs>
      <!-- 手繪感扭曲濾鏡：利用分形雜訊讓幾何線條產生天然的液態、有機邊緣（與 film grain 和 WebGL 完美呼應） -->
      <filter id="hd" x="-12%" y="-12%" width="124%" height="124%">
        <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="2" seed="6" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>

    <!-- ===== FRIDAY_NIGHT : 同心圓 — 孤獨、深邃漣漪 ===== -->
    <!-- 優化：微調圓心使其具有極其微妙的偏心感（朝左下略微偏移），並在最中心點綴一顆凝聚的實心微粒，強化孤星般的凝視感 -->
    <template v-if="mood === 'friday_night'">
      <g filter="url(#hd)" stroke="currentColor" fill="none" stroke-linecap="round">
        <circle cx="50" cy="50" r="2.5" fill="currentColor" stroke="none" opacity="0.95" />
        <circle cx="49.5" cy="50.5" r="10" stroke-width="1.6" opacity="0.88" />
        <circle cx="49.0" cy="51.0" r="17" stroke-width="1.4" opacity="0.82" />
        <circle cx="48.5" cy="51.5" r="24" stroke-width="1.2" opacity="0.75" />
        <circle cx="48.0" cy="52.0" r="31" stroke-width="1.1" opacity="0.66" />
        <circle cx="47.5" cy="52.5" r="38" stroke-width="1.0" opacity="0.55" />
        <circle cx="47.0" cy="53.0" r="45" stroke-width="0.9" opacity="0.35" />
      </g>
    </template>

    <!-- ===== DATE_NIGHT : 雙星化學反應 — 兩人心靈交織的星芒 ===== -->
    <!-- 優化：由單一中心爆發改為「兩個光芒中心」的微妙相交與干涉，射線彼此交織穿透，完美隱喻兩個人相遇時產生的奇妙「化學反應」 -->
    <template v-else-if="mood === 'date_night'">
      <g filter="url(#hd)" stroke="currentColor" fill="none" stroke-linecap="round">
        <!-- 兩顆相依的靈魂核心 -->
        <circle cx="42" cy="46" r="3" fill="currentColor" stroke="none" opacity="0.90" />
        <circle cx="58" cy="54" r="3.5" fill="currentColor" stroke="none" opacity="0.90" />
        
        <!-- 左星 (Center: 42, 46) 散發的星芒 -->
        <line x1="42" y1="46" x2="42" y2="8"   stroke-width="1.3" opacity="0.75" />
        <line x1="42" y1="46" x2="74" y2="24"  stroke-width="1.1" opacity="0.65" />
        <line x1="42" y1="46" x2="80" y2="46"  stroke-width="1.3" opacity="0.70" />
        <line x1="42" y1="46" x2="68" y2="72"  stroke-width="1.1" opacity="0.60" />
        <line x1="42" y1="46" x2="42" y2="82"  stroke-width="1.3" opacity="0.75" />
        <line x1="42" y1="46" x2="16" y2="72"  stroke-width="1.1" opacity="0.65" />
        <line x1="42" y1="46" x2="8"  y2="46"  stroke-width="1.3" opacity="0.70" />
        <line x1="42" y1="46" x2="16" y2="20"  stroke-width="1.1" opacity="0.60" />

        <!-- 右星 (Center: 58, 54) 散發的星芒 -->
        <line x1="58" y1="54" x2="58" y2="92"  stroke-width="1.3" opacity="0.75" />
        <line x1="58" y1="54" x2="26" y2="76"  stroke-width="1.1" opacity="0.65" />
        <line x1="58" y1="54" x2="20" y2="54"  stroke-width="1.3" opacity="0.70" />
        <line x1="58" y1="54" x2="32" y2="28"  stroke-width="1.1" opacity="0.60" />
        <line x1="58" y1="54" x2="58" y2="18"  stroke-width="1.3" opacity="0.75" />
        <line x1="58" y1="54" x2="84" y2="32"  stroke-width="1.1" opacity="0.65" />
        <line x1="58" y1="54" x2="92" y2="54"  stroke-width="1.3" opacity="0.70" />
        <line x1="58" y1="54" x2="84" y2="80"  stroke-width="1.1" opacity="0.60" />
      </g>
    </template>

    <!-- ===== FAMILY_TIME : 等高線波動 — 溫厚港灣、歲月靜好 ===== -->
    <!-- 優化：保持極其溫柔和諧的平行波動，象徵家庭的安全感與平靜寬厚的大海 -->
    <template v-else-if="mood === 'family_time'">
      <g filter="url(#hd)" stroke="currentColor" fill="none" stroke-linecap="round">
        <path d="M 5 18 C 18 12, 34 24, 50 18 C 66 12, 82 22, 95 16" stroke-width="1.5" opacity="0.90" />
        <path d="M 5 29 C 20 23, 36 35, 50 29 C 64 23, 80 33, 95 27" stroke-width="1.4" opacity="0.84" />
        <path d="M 5 40 C 18 34, 38 46, 50 40 C 62 34, 82 44, 95 38" stroke-width="1.3" opacity="0.78" />
        <path d="M 5 51 C 22 45, 36 57, 50 51 C 64 45, 78 55, 95 49" stroke-width="1.2" opacity="0.72" />
        <path d="M 5 62 C 18 56, 38 68, 50 62 C 62 56, 82 66, 95 60" stroke-width="1.1" opacity="0.64" />
        <path d="M 5 73 C 22 67, 36 79, 50 73 C 64 67, 78 77, 95 71" stroke-width="1.0" opacity="0.54" />
        <path d="M 5 84 C 18 78, 38 90, 50 84 C 62 78, 82 88, 95 82" stroke-width="0.9" opacity="0.42" />
      </g>
    </template>

    <!-- ===== NEED_A_CRY : 流淌星淚 — 淚滴凝結、微光下墜 ===== -->
    <!-- 優化：加入兩道極其輕柔的「重力淚痕細線」，讓靜態點陣中浮現出一絲液體流動下墜的動態暗示，使大哭的釋放感更加動人 -->
    <template v-else-if="mood === 'need_a_cry'">
      <g filter="url(#hd)" stroke="currentColor" fill="currentColor" stroke-linecap="round">
        <!-- 兩道優雅的半透明垂直重力下墜淚痕 -->
        <path d="M 50 30 Q 50 54 49.5 68" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.18" />
        <path d="M 28 42 Q 28 60 27.5 70" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.12" />
        
        <!-- 上方：稀疏細小 -->
        <circle cx="32" cy="14" r="1.4" opacity="0.40" />
        <circle cx="60" cy="18" r="1.1" opacity="0.36" />
        <circle cx="76" cy="26" r="1.3" opacity="0.38" />
        <!-- 中層：逐漸變大 -->
        <circle cx="20" cy="42" r="2.2" opacity="0.58" />
        <circle cx="50" cy="38" r="2.5" opacity="0.62" />
        <circle cx="78" cy="44" r="2.0" opacity="0.55" />
        <circle cx="36" cy="56" r="2.3" opacity="0.60" />
        <circle cx="66" cy="60" r="2.2" opacity="0.58" />
        <!-- 下方：密集粗大（眼淚聚集） -->
        <circle cx="28" cy="72" r="3.2" opacity="0.82" />
        <circle cx="50" cy="70" r="3.8" opacity="0.90" />
        <circle cx="72" cy="74" r="3.2" opacity="0.84" />
        <circle cx="38" cy="86" r="3.5" opacity="0.92" />
        <circle cx="62" cy="88" r="3.0" opacity="0.86" />
      </g>
    </template>

    <!-- ===== FEEL_GOOD : 璀璨鑽石星芒與雙重軌道 — 撥雲見日、內心「亮了」 ===== -->
    <!-- 重構：徹底拋棄複雜、細碎的星芒線條，改用極致對稱、高貴典雅的「宇宙星芒與土星環」幾何結構。 -->
    <!-- 完美呼應 description「看完整個人都亮了」的意境。中央為鑽石星心，外圍為兩道極其纖細的傾斜行星軌道，極具高級珠寶與天文美學的頂奢質感。 -->
    <template v-else-if="mood === 'feel_good'">
      <g filter="url(#hd)" stroke="currentColor" fill="none" stroke-linecap="round">
        <!-- 雙重傾斜的行星軌道（Saturn Orbits） — 營造空間張力與懸浮質感 -->
        <ellipse cx="50" cy="50" rx="36" ry="12" stroke-width="1.1" transform="rotate(-15 50 50)" opacity="0.45" />
        <ellipse cx="50" cy="50" rx="44" ry="15" stroke-width="0.8" transform="rotate(-15 50 50)" opacity="0.25" />

        <!-- 8向精細對稱星芒（八角星芒） — 象徵光芒四射的開朗能量 -->
        <!-- 主軸 -->
        <line x1="50" y1="14" x2="50" y2="86" stroke-width="1.3" opacity="0.80" />
        <line x1="14" y1="50" x2="86" y2="50" stroke-width="1.3" opacity="0.80" />
        <!-- 對角軸 -->
        <line x1="24.5" y1="24.5" x2="75.5" y2="75.5" stroke-width="0.9" opacity="0.55" />
        <line x1="24.5" y1="75.5" x2="75.5" y2="24.5" stroke-width="0.9" opacity="0.55" />

        <!-- 最中心點亮的核心：實心精緻鑽石菱形 (Diamond Core) -->
        <path d="M 50 40 L 57 50 L 50 60 L 43 50 Z" fill="currentColor" stroke="none" opacity="0.95" />
      </g>
    </template>

    <!-- ===== EPIC_ADVENTURE : 史詩羽翼劈斬 — 速度、力量與衝擊感 ===== -->
    <!-- 優化：將原本的單調線條改為「兩端收尖、中央豐滿」的劈斬尖羽形狀，極大地增強了速度感與破空張力，宛如利刃、光速或展翅飛翔 -->
    <template v-else-if="mood === 'epic_adventure'">
      <g filter="url(#hd)" fill="currentColor" stroke="none" opacity="0.90">
        <!-- 四道具有破空速度感的斜向羽翼劈斬 -->
        <path d="M 10 94 Q 28 66 62 10 Q 40 48 10 94 Z" opacity="0.95" />
        <path d="M 34 96 Q 50 68 92 16 Q 72 50 34 96 Z" opacity="0.85" />
        <path d="M 2  70 Q 18 44 50 6  Q 30 30 2  70 Z"  opacity="0.66" />
        <path d="M 56 96 Q 70 76 98 36 Q 82 60 56 96 Z"  opacity="0.45" />
      </g>
    </template>
  </svg>
</template>

<style scoped>
.mood-icon {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
