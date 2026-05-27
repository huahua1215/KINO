import type { Ref } from 'vue'

const MOOD_INDICES: Record<string, number> = {
  feel_good: 0, need_a_cry: 1, epic_adventure: 2, friday_night: 3,
  date_night: 4, family_time: 5,
}

const VERT = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
  precision highp float;
  uniform vec2  u_res;
  uniform int   u_mood;
  uniform float u_time;

  #define PI 3.14159265358979323846

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise2(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash21(i),                    b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0)),   d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float f = 0.0, a = 0.5;
    mat2 m = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 4; i++) {
      f += a * noise2(p);
      p  = m * p * 2.02;
      a *= 0.5;
    }
    return f;
  }

  // 雲朵 blob：加入 u_time 讓 FBM 種子緩慢漂移，形狀像真雲一樣呼吸變形
  float cloudBlob(vec2 p, float w) {
    vec2 ts = vec2(u_time * 0.008, u_time * 0.006);
    vec2 q  = vec2(fbm(p + ts),                          fbm(p + vec2(5.2, 1.3) - ts));
    vec2 r  = vec2(fbm(p + w*q + vec2(1.7, 9.2) + ts),   fbm(p + w*q + vec2(8.3, 2.8)));
    return fbm(p + w * r);
  }

  // 每個 blob 的慢速漂移偏移（振幅約 3% UV，相位 120° 間隔使三個 blob 不同步）
  vec2 drift(float t, float sp, float ph) {
    return vec2(sin(t * sp + ph) * 0.030, cos(t * sp * 0.75 + ph + 1.57) * 0.022);
  }

  float grain(vec2 uv) { return (noise2(uv * 260.0) - 0.5) * 0.042; }

  // 形狀固定的 blob（不隨時間變形，只靠外部位移移動）
  float staticBlob(vec2 p, float w) {
    vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
    vec2 r = vec2(fbm(p + w*q + vec2(1.7, 9.2)), fbm(p + w*q + vec2(8.3, 2.8)));
    return fbm(p + w * r);
  }

  // 流沙粒子：y 方向持續向下，每列有獨立速度變異製造有機感
  float sandFlow(vec2 uv, float gridN, float speed, float seed) {
    float colID  = floor(uv.x * gridN * 0.65);
    float colVar = 0.55 + 0.90 * hash21(vec2(colID * 0.11, seed + 0.37));
    vec2  sUV    = vec2(uv.x, fract(uv.y + u_time * speed * colVar));
    vec2  gi     = floor(sUV * gridN);
    vec2  gf     = fract(sUV * gridN);
    vec2  sp     = vec2(hash21(gi + seed), hash21(gi + seed + 1.31));
    float bri    = hash21(gi + seed + 2.73);
    return smoothstep(0.13, 0.0, length(gf - sp)) * pow(bri, 2.2);
  }

  // 星空格子：在 gridN×gridN 的格子中隨機放置閃爍星點
  float starField(vec2 uv, float gridN, float radius, float speed, float seed) {
    vec2 gi = floor(uv * gridN);
    vec2 gf = fract(uv * gridN);
    vec2 sp = vec2(hash21(gi + seed), hash21(gi + seed + 7.31));
    float bri = hash21(gi + seed + 3.17);
    float twinkle = 0.65 + 0.35 * sin(u_time * speed * (0.5 + bri) + bri * 6.28);
    return smoothstep(radius, 0.0, length(gf - sp)) * pow(bri, 5.5) * twinkle;
  }

  // ECG 波形：P-Q-R-S-T 以高斯函數逼近，x ∈ [0,1] = 一個心跳週期
  float ecgWave(float x) {
    float pw =  0.14 * exp(-pow((x - 0.12)  * 38.0,  2.0));
    float q  = -0.22 * exp(-pow((x - 0.235) * 85.0,  2.0));
    float r  =  2.60 * exp(-pow((x - 0.255) * 130.0, 2.0));
    float s  = -0.42 * exp(-pow((x - 0.278) * 85.0,  2.0));
    float tw =  0.28 * exp(-pow((x - 0.42)  * 26.0,  2.0));
    return pw + q + r + s + tw;
  }

  // 6色馬卡龍/粉彩柔和彩虹光譜
  vec3 getRainbow(float x) {
    x = clamp(x, 0.0, 1.0);
    vec3 c1 = vec3(0.95, 0.38, 0.52);   // 蜜桃粉紅 (Peach Pink)
    vec3 c2 = vec3(0.96, 0.62, 0.30);   // 溫暖粉橘 (Soft Orange)
    vec3 c3 = vec3(0.95, 0.85, 0.22);   // 金黃芒果 (Mango Gold)
    vec3 c4 = vec3(0.28, 0.78, 0.55);   // 薄荷嫩綠 (Mint Green)
    vec3 c5 = vec3(0.24, 0.68, 0.92);   // 天空澄藍 (Sky Blue)
    vec3 c6 = vec3(0.55, 0.44, 0.88);   // 夢幻薰紫 (Lavender Violet)
    
    if (x < 0.2) return mix(c1, c2, x / 0.2);
    if (x < 0.4) return mix(c2, c3, (x - 0.2) / 0.2);
    if (x < 0.6) return mix(c3, c4, (x - 0.4) / 0.2);
    if (x < 0.8) return mix(c4, c5, (x - 0.6) / 0.2);
    return mix(c5, c6, (x - 0.8) / 0.2);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    uv.y = 1.0 - uv.y;
    vec3  col   = vec3(0.0);
    float alpha = 0.0;

    // ── 0  HAPPY ─────────────────────────────────────────────────────────────
    // 雀躍彩霞：移除條狀彩虹（避免彩虹旗的聯想），改為 5 團亮麗、充滿朝氣的粉彩馬卡龍水彩團（金黃、蜜桃粉、薄荷綠、天空藍、暖陽橙）有機交融，呈現陽光灑落水面、五彩斑斕的雀躍質感。
    if (u_mood == 0) {
      float t = u_time;

      // ── 雙重流體動力學優化（微調降速，尋找動態美感與優雅質感的最完美平衡） ──
      // 1. 宏觀大幅度游動（保留大範圍游動軌跡，但速度降低 55% 呈現高級感緩漂）
      vec2 d1 = vec2(sin(t * 0.11) * 0.16, cos(t * 0.08) * 0.12);
      vec2 d2 = vec2(sin(t * 0.08 + 1.2) * 0.14, cos(t * 0.10 + 2.0) * 0.10);
      vec2 d3 = vec2(sin(t * 0.13 + 2.4) * 0.18, cos(t * 0.06 + 4.0) * 0.13);
      vec2 d4 = vec2(sin(t * 0.07 + 3.6) * 0.13, cos(t * 0.12 + 1.0) * 0.09);
      vec2 d5 = vec2(sin(t * 0.10 - 1.0) * 0.15, cos(t * 0.09 - 0.5) * 0.11);

      // 2. 微觀內部液體流動（流速調慢 60%，使內部紋理如濃稠油墨般順滑、優雅地在水面緩慢淌過）
      vec2 flow = vec2(t * 0.060, t * 0.050);

      // 5 團水墨的形狀與覆蓋範圍，結合時間滾動偏移
      float s1 = smoothstep(0.35, 0.70, cloudBlob((uv - vec2(0.28, 0.32) + d1 - flow * 0.8) * vec2(1.10, 1.05), 1.80));
      float s2 = smoothstep(0.35, 0.70, cloudBlob((uv - vec2(0.72, 0.36) + d2 - flow * 1.1) * vec2(1.05, 1.10), 1.70));
      float s3 = smoothstep(0.38, 0.68, cloudBlob((uv - vec2(0.50, 0.70) + d3 - flow * 0.9) * vec2(1.00, 1.00), 1.90));
      float s4 = smoothstep(0.36, 0.68, cloudBlob((uv - vec2(0.32, 0.68) + d4 - flow * 1.2) * vec2(1.15, 0.95), 1.65));
      float s5 = smoothstep(0.38, 0.72, cloudBlob((uv - vec2(0.68, 0.65) + d5 - flow * 1.0) * vec2(0.95, 1.15), 1.85));

      vec3  c1 = vec3(0.96, 0.82, 0.20);   // 金黃芒果 (Mango Gold)
      vec3  c2 = vec3(0.95, 0.38, 0.52);   // 蜜桃粉紅 (Peach Pink)
      vec3  c3 = vec3(0.28, 0.78, 0.55);   // 薄荷嫩綠 (Mint Green)
      vec3  c4 = vec3(0.24, 0.68, 0.92);   // 天空澄藍 (Sky Blue)
      vec3  c5 = vec3(0.96, 0.60, 0.28);   // 暖陽粉橘 (Warm Orange)

      float tot = s1 + s2 + s3 + s4 + s5 + 0.001;
      vec3  rainbowColor = (c1*s1 + c2*s2 + c3*s3 + c4*s4 + c5*s5) / tot;
      float alphaVal = (1.0 - (1.0-s1)*(1.0-s2)*(1.0-s3)*(1.0-s4)*(1.0-s5)) * 0.70;

      col = clamp(rainbowColor + grain(uv), 0.0, 1.0);
      alpha = clamp(alphaVal, 0.0, 1.0);
    }

    // ── 1  SAD ───────────────────────────────────────────────────────────────
    // 流動彩墨：將大色團改為 4 股「縱向垂墜、窄細高對比」的流動水路，流速提升 6 倍，使下滑動態清晰可見
    else if (u_mood == 1) {
      float t  = u_time;

      // 每個水流通道的左右搖擺（橫向蛇行，頻率不同避免同步）
      float sway1 = sin(t * 0.35) * 0.022;
      float sway2 = sin(t * 0.28 + 1.5) * 0.018;
      float sway3 = sin(t * 0.42 + 3.0) * 0.025;
      float sway4 = sin(t * 0.31 - 1.0) * 0.020;

      // 縱向拉伸與橫向壓縮：X軸乘上 3.5（變窄細），Y軸乘上 0.42（變拉長）
      // 將時間偏移改為相減（-），使紋理取樣點反向移動，視覺效果便會順著重力「向下滾動流淌」
      float s1 = smoothstep(0.46, 0.72, cloudBlob((uv - vec2(0.15 + sway1, 0.0) - vec2(0.0, t * 0.22)) * vec2(3.6, 0.42), 2.10));
      float s2 = smoothstep(0.46, 0.72, cloudBlob((uv - vec2(0.42 + sway2, 0.0) - vec2(0.0, t * 0.16)) * vec2(3.2, 0.38), 1.95));
      float s3 = smoothstep(0.48, 0.70, cloudBlob((uv - vec2(0.68 + sway3, 0.0) - vec2(0.0, t * 0.26)) * vec2(3.8, 0.45), 2.25));
      float s4 = smoothstep(0.48, 0.70, cloudBlob((uv - vec2(0.88 + sway4, 0.0) - vec2(0.0, t * 0.18)) * vec2(3.4, 0.40), 2.00));

      vec3  bc1 = vec3(0.04, 0.10, 0.28);
      vec3  bc2 = vec3(0.30, 0.24, 0.55);
      vec3  bc3 = vec3(0.10, 0.36, 0.48);
      vec3  bc4 = vec3(0.02, 0.20, 0.60);

      float blobU = 1.0 - (1.0 - s1) * (1.0 - s2) * (1.0 - s3) * (1.0 - s4);
      float btot = s1 + s2 + s3 + s4 + 0.001;
      vec3  blobC = (bc1 * s1 + bc2 * s2 + bc3 * s3 + bc4 * s4) / btot;

      col = clamp(blobC + grain(uv), 0.0, 1.0);
      alpha = clamp(blobU * 0.42, 0.0, 1.0);
    }

    // ── 2  EXCITED ───────────────────────────────────────────────────────────
    // 興奮狂潮：外在優雅靜流，內在「電晶拉絲」狂熱噴湧！
    // 為避免畫面過於混亂雜亂，我們進行了極為高雅的平衡：
    // 1. 移除色團外廓的劇烈抖動與彈性膨脹，使其維持大氣、緩慢、安定的優雅漂浮（與其他場景維持一致的視覺沉浸感）；
    // 2. 完美保留色團內部「電晶絲線與熔岩流道」的高頻閃爍、遊走與流淌動畫！
    // 這種「外靜內動」的對比，既充滿了興奮能量，又顯得高雅深邃、乾淨利落！
    else if (u_mood == 2) {
      float t  = u_time;
      
      // 外部 Blob 使用與原本一致的大氣、寬幅、優雅且緩慢的漂浮位移（幅寬拉大至 0.13~0.16，頻率降低，還原水彩慢速淌流感）
      vec2 d1  = vec2(sin(t * 0.11) * 0.15, cos(t * 0.08) * 0.11);
      vec2 d2  = vec2(sin(t * 0.08 + 1.2) * 0.13, cos(t * 0.10 + 2.0) * 0.09);
      vec2 d3  = vec2(sin(t * 0.13 + 2.4) * 0.16, cos(t * 0.06 + 4.0) * 0.12);

      // 1. 外部大水墨 Blob 遮罩（維持原本優雅安定的水彩形狀，緩緩流動）
      float s1 = smoothstep(0.38, 0.70, cloudBlob((uv - vec2(0.46, 0.38) + d1) * 2.20, 2.90));
      float s2 = smoothstep(0.38, 0.70, cloudBlob((uv - vec2(0.72, 0.28) + d2) * 2.40, 2.70));
      float s3 = smoothstep(0.38, 0.70, cloudBlob((uv - vec2(0.26, 0.68) + d3) * 2.10, 2.80));

      // 2. 內部低頻「流沙拉絲」運算（大幅降低正弦頻率，使線條密度減少 60%，線條數量明顯少很多、間距變寬）
      float fbmVal = fbm(uv * 7.5 - vec2(t * 0.32, t * 0.52)); 
      
      float v1 = sin(fbmVal * 6.5 + t * 2.2);
      float v2 = sin(fbmVal * 5.0 - t * 1.8 + 2.0);
      float v3 = sin(fbmVal * 5.8 + t * 2.0 - 1.0);
      
      // 3. 收窄線條寬度（將 smoothstep 窗口從 0.35 收窄至 0.13，使發光線條變得纖細、精緻、如同金絲拉線，精細感倍增）
      float vein1 = smoothstep(0.0, 0.13, abs(v1));
      float vein2 = smoothstep(0.0, 0.13, abs(v2));
      float vein3 = smoothstep(0.0, 0.13, abs(v3));
 
      // 4. 純暖雙色系：精緻柔和的「橘紅色系」溫潤火山色系 (Pure Orange & Red Volcano Palette)
      // 將三組線條顏色進一步往溫暖的「純橘色系」調整，使拉絲呈現如熔岩金絲般璀璨的橙色光芒
      vec3  deepCrimson   = vec3(0.48, 0.14, 0.10);
      vec3  goldYellow    = vec3(0.68, 0.38, 0.06);

      vec3  deepPurple    = vec3(0.62, 0.28, 0.06);
      vec3  neonTangerine = vec3(0.66, 0.32, 0.05);

      vec3  deepScarlet   = vec3(0.44, 0.06, 0.05);
      vec3  electricPink  = vec3(0.65, 0.28, 0.04);

      vec3  c1 = mix(goldYellow, deepCrimson, vein1);
      vec3  c2 = mix(neonTangerine, deepPurple, vein2);
      vec3  c3 = mix(electricPink, deepScarlet, vein3);

      float tot = s1 + s2 + s3 + 0.001;
      col = clamp((c1*s1 + c2*s2 + c3*s3) / tot + grain(uv), 0.0, 1.0);
      alpha = (1.0-(1.0-s1)*(1.0-s2)*(1.0-s3)) * 0.60;
    }
    // 放鬆/平靜：極靜與極動的藝術平衡 —「微風流雲，流淌漫步」
    // 1. 大範圍慢漂移：位移半徑設為 0.11~0.15，速度微調至靈動卻舒緩的頻率。
    // 2. 內部微觀流體流動：加入專屬的 slow scrolling flow。當坐標隨時間滾動偏移時，
    //    鼠尾草綠與天藍色團的內部水彩紋理，會像被溫柔的微風吹拂一樣，在畫面上緩緩而持續地流動流淌！
    else if (u_mood == 3) {
      float t  = u_time;
      
      // 外部 Blob 的慢漂位移（小幅提升頻率，使流動感清晰顯眼）
      vec2 d1  = vec2(sin(t * 0.075) * 0.14,         cos(t * 0.062) * 0.10);
      vec2 d2  = vec2(sin(t * 0.075 + 2.09) * 0.13,  cos(t * 0.062 + 2.09) * 0.09);
      vec2 d3  = vec2(sin(t * 0.075 + 4.19) * 0.15,  cos(t * 0.062 + 4.19) * 0.11);

      // 放鬆專屬慢流速滾動向量，賦予色團「內部流體」持續前行的生命力
      vec2 flow = vec2(t * 0.035, t * 0.025);

      // 引入 -flow，讓色團在優雅位移的同時，內部紋理像在水中漫漫化開、緩緩流動
      float s1 = smoothstep(0.30, 0.70, cloudBlob((uv - vec2(0.28, 0.46) + d1 - flow * 0.6) * vec2(1.15, 2.50), 1.30));
      float s2 = smoothstep(0.30, 0.70, cloudBlob((uv - vec2(0.55, 0.50) + d2 - flow * 0.8) * vec2(1.20, 2.55), 1.35));
      float s3 = smoothstep(0.30, 0.70, cloudBlob((uv - vec2(0.78, 0.54) + d3 - flow * 0.7) * vec2(1.15, 2.48), 1.28));

      vec3  c1 = vec3(0.48, 0.72, 0.88); // 靜夜天青
      vec3  c2 = vec3(0.52, 0.76, 0.72); // 柔羽綠
      vec3  c3 = vec3(0.88, 0.84, 0.72); // 暖沙金

      float tot = s1 + s2 + s3 + 0.001;
      col = clamp((c1*s1 + c2*s2 + c3*s3) / tot + grain(uv), 0.0, 1.0);
      alpha = (1.0-(1.0-s1)*(1.0-s2)*(1.0-s3)) * 0.60;
    }

    // ── 4  ROMANTIC ──────────────────────────────────────────────────────────
    // 極致奢華浪漫：純淨色彩拂動流彩與風中落櫻！
    // 1. 微風拂霧：加入慢流滾動向量，使多彩雲朵內部如同墨體般溫柔流淌。
    // 2. 絢麗色調：融合珊瑚粉、天青藍、香檳暖金與夢幻紫丁香的繽紛漸變。
    // 3. 落英繽紛：空氣中飄游 3 片風中旋轉自轉、由右向左飄浮移動的半透明落花瓣。
    else if (u_mood == 4) {
      float t   = u_time;
      float px1 = t*0.052 + 1.1*sin(t*0.038);
      float px2 = t*0.052 + 1.1*sin(t*0.038+1.57);
      float px3 = t*0.052 + 1.1*sin(t*0.038+3.14);
      float px4 = t*0.052 + 1.1*sin(t*0.038+4.71);
      vec2 d1 = vec2(sin(px1)*0.050, cos(px1*0.72)*0.038);
      vec2 d2 = vec2(sin(px2)*0.050, cos(px2*0.72)*0.038);
      vec2 d3 = vec2(sin(px3)*0.050, cos(px3*0.72)*0.038);
      vec2 d4 = vec2(sin(px4)*0.050, cos(px4*0.72)*0.038);

      // 浪漫專屬微風慢流滾動向量
      vec2 romanticFlow = vec2(t * 0.026, t * 0.018);

      // 雲朵 blob
      float s1 = smoothstep(0.32, 0.68, cloudBlob((uv - vec2(0.24, 0.28) + d1 - romanticFlow * 0.5) * 1.90, 1.65));
      float s2 = smoothstep(0.32, 0.68, cloudBlob((uv - vec2(0.72, 0.32) + d2 - romanticFlow * 0.7) * 1.82, 1.70));
      float s3 = smoothstep(0.32, 0.68, cloudBlob((uv - vec2(0.30, 0.68) + d3 - romanticFlow * 0.6) * 1.86, 1.62));
      float s4 = smoothstep(0.32, 0.68, cloudBlob((uv - vec2(0.68, 0.62) + d4 - romanticFlow * 0.8) * 1.84, 1.68));

      // ── Blob 1: 玫瑰粉與蜜桃珊瑚金 ──
      vec2  tc1   = uv - vec2(0.24, 0.28) + d1;
      float r1    = length(tc1);
      vec3  fb1   = mix(vec3(0.99, 0.54, 0.44), vec3(0.88, 0.10, 0.30), (1.0 - smoothstep(0.0, 0.13, r1)) * 0.58);

      // ── Blob 2: 天青藍與夢幻薰衣草紫 ──
      vec2  tc2   = uv - vec2(0.72, 0.32) + d2;
      float r2    = length(tc2);
      vec3  fb2   = mix(vec3(0.30, 0.75, 0.95), vec3(0.28, 0.08, 0.80), (1.0 - smoothstep(0.0, 0.13, r2)) * 0.58);

      // ── Blob 3: 櫻花粉與蜜桃杏橘 ──
      vec2  tc3   = uv - vec2(0.30, 0.68) + d3;
      float r3    = length(tc3);
      vec3  fb3   = mix(vec3(0.99, 0.52, 0.68), vec3(0.92, 0.24, 0.14), (1.0 - smoothstep(0.0, 0.13, r3)) * 0.58);

      // ── Blob 4: 香檳暖金與夢幻紫丁香 ──
      vec2  tc4   = uv - vec2(0.68, 0.62) + d4;
      float r4    = length(tc4);
      vec3  fb4   = mix(vec3(0.98, 0.82, 0.28), vec3(0.50, 0.08, 0.72), (1.0 - smoothstep(0.0, 0.13, r4)) * 0.58);

      vec3  fc1 = fb1;
      vec3  fc2 = fb2;
      vec3  fc3 = fb3;
      vec3  fc4 = fb4;

      float tot     = s1 + s2 + s3 + s4 + 0.001;
      vec3  blobCol = (fc1*s1 + fc2*s2 + fc3*s3 + fc4*s4) / tot;
      float blobA   = (1.0-(1.0-s1)*(1.0-s2)*(1.0-s3)*(1.0-s4)) * 0.50;

      vec3  finalCol = blobCol;
      float finalA   = blobA;

      col   = clamp(finalCol + grain(uv), 0.0, 1.0);
      alpha = clamp(finalA, 0.0, 1.0);
    }

    // ── 5  SCARED ────────────────────────────────────────────────────────────
    // 渾沌形變：預扭曲 + cloudBlob 內部雙層 = 三重 domain warping，邊緣持續不規則撕裂
    // ── 5  FAMILY_TIME ───────────────────────────────────────────────────────
    // 爐火圍坐：五個暖橘/玫瑰/蜜金 blob 層次聚攏，中心輻射溫暖光暈，緩慢呼吸
    else if (u_mood == 5) {
      float t      = u_time;
      float breath = 0.5 + 0.5 * sin(t * 0.80);
      float warmth = 0.5 + 0.5 * sin(t * 0.45);

      vec2 d1 = vec2(sin(t*0.30)*0.078, cos(t*0.24)*0.090 + sin(t*0.40)*0.038);
      vec2 d2 = vec2(sin(t*0.25+1.8)*0.068, cos(t*0.35+2.3)*0.075);
      vec2 d3 = vec2(sin(t*0.35+3.6)*0.070, cos(t*0.21+1.0)*0.062);
      vec2 d4 = vec2(sin(t*0.27-1.2)*0.056, cos(t*0.39-2.0)*0.070);
      vec2 d5 = vec2(sin(t*0.32+5.0)*0.050, cos(t*0.28+4.0)*0.056);

      float s1 = smoothstep(0.30, 0.64, cloudBlob((uv - vec2(0.50, 0.55) + d1) * 1.55, 1.88)) * (0.92 + breath * 0.06);
      float s2 = smoothstep(0.34, 0.62, cloudBlob((uv - vec2(0.24, 0.60) + d2) * 2.00, 1.92)) * 0.80;
      float s3 = smoothstep(0.34, 0.62, cloudBlob((uv - vec2(0.76, 0.58) + d3) * 2.05, 1.88)) * 0.76;
      float s4 = smoothstep(0.38, 0.60, cloudBlob((uv - vec2(0.36, 0.28) + d4) * 2.70, 1.80)) * (0.55 + warmth * 0.12);
      float s5 = smoothstep(0.38, 0.60, cloudBlob((uv - vec2(0.64, 0.28) + d5) * 2.75, 1.76)) * (0.50 + warmth * 0.12);

      vec3 c1 = vec3(0.62, 0.38, 0.18);
      vec3 c2 = vec3(0.56, 0.32, 0.14);
      vec3 c3 = vec3(0.70, 0.52, 0.24);
      vec3 c4 = vec3(0.66, 0.42, 0.34);
      vec3 c5 = vec3(0.74, 0.62, 0.40);
      float tot = s1 + s2 + s3 + s4 + s5 + 0.001;

      col   = clamp((c1*s1 + c2*s2 + c3*s3 + c4*s4 + c5*s5) / tot
                    + grain(uv) * 0.40, 0.0, 1.0);
      alpha = (1.0-(1.0-s1)*(1.0-s2)*(1.0-s3)*(1.0-s4)*(1.0-s5)) * (0.65 + breath * 0.04);
    }

    // ── 6  ONLY_90MIN ────────────────────────────────────────────────────────
    // 流沙：四條 blob 串流向下循環，有機形狀 + 視差速度，暖琥珀沙色
    else if (u_mood == 6) {
      float t = u_time;

      // 四條流的 y 位置（fract 讓 blob 到底後從頂部重新進入）
      // 每條各自速度不同；同一條的兩個 blob 相差 0.5 確保永遠有一個在畫面內
      float ya1 = fract(0.10 + t * 0.130);  float ya2 = fract(0.60 + t * 0.130);
      float yb1 = fract(0.45 + t * 0.155);  float yb2 = fract(0.95 + t * 0.155);
      float yc1 = fract(0.05 + t * 0.112);  float yc2 = fract(0.55 + t * 0.112);
      float yd1 = fract(0.72 + t * 0.140);  float yd2 = fract(0.22 + t * 0.140);

      // 四條流 x 位置：0.22 / 0.42 / 0.60 / 0.78，y 方向拉長模擬被重力拉伸
      float sA1 = smoothstep(0.34, 0.62, staticBlob((uv - vec2(0.22, ya1)) * vec2(4.0, 2.6), 1.72));
      float sA2 = smoothstep(0.34, 0.62, staticBlob((uv - vec2(0.22, ya2)) * vec2(4.0, 2.6), 1.70));
      float sB1 = smoothstep(0.34, 0.62, staticBlob((uv - vec2(0.42, yb1)) * vec2(3.8, 2.5), 1.75));
      float sB2 = smoothstep(0.34, 0.62, staticBlob((uv - vec2(0.42, yb2)) * vec2(3.8, 2.5), 1.73));
      float sC1 = smoothstep(0.34, 0.62, staticBlob((uv - vec2(0.60, yc1)) * vec2(3.9, 2.6), 1.68));
      float sC2 = smoothstep(0.34, 0.62, staticBlob((uv - vec2(0.60, yc2)) * vec2(3.9, 2.6), 1.74));
      float sD1 = smoothstep(0.34, 0.62, staticBlob((uv - vec2(0.78, yd1)) * vec2(4.1, 2.5), 1.71));
      float sD2 = smoothstep(0.34, 0.62, staticBlob((uv - vec2(0.78, yd2)) * vec2(4.1, 2.5), 1.76));

      // 沙色調：中性琥珀 / 亮沙金 / 深棕沙 / 暖沙橘
      vec3 sand1 = vec3(0.68, 0.46, 0.20);
      vec3 sand2 = vec3(0.80, 0.60, 0.30);
      vec3 sand3 = vec3(0.54, 0.34, 0.14);
      vec3 sand4 = vec3(0.76, 0.54, 0.24);

      float totAll = sA1+sA2+sB1+sB2+sC1+sC2+sD1+sD2 + 0.001;
      col = clamp((sand1*(sA1+sC2) + sand2*(sA2+sC1) + sand3*(sB1+sD2) + sand4*(sB2+sD1)) / totAll
                 + grain(uv) * 0.40, 0.0, 1.0);
      alpha = (1.0-(1.0-sA1)*(1.0-sA2)*(1.0-sB1)*(1.0-sB2)
                  *(1.0-sC1)*(1.0-sC2)*(1.0-sD1)*(1.0-sD2)) * 0.84;
    }

    // ── 7  HIDDEN_GEM (GALAXY) ───────────────────────────────────────────────
    // 星空銀河：宇宙星雲 blob + 銀河帶核心 + 三層閃爍星點
    else if (u_mood == 7) {
      float t = u_time;

      // 極緩漂移的宇宙氣雲
      vec2 nb = vec2(sin(t*0.015)*0.014, cos(t*0.012)*0.011);
      float n1 = smoothstep(0.18, 0.68, cloudBlob((uv - vec2(0.34, 0.56) + nb       ) * 1.46, 2.12)) * 0.58;
      float n2 = smoothstep(0.18, 0.68, cloudBlob((uv - vec2(0.66, 0.44) + nb * 0.76) * 1.50, 2.06)) * 0.48;
      float n3 = smoothstep(0.22, 0.62, cloudBlob((uv - vec2(0.50, 0.24) + nb * 0.56) * 2.25, 2.00)) * 0.34;

      // 銀河帶：斜向柔光條
      float band = exp(-pow((uv.x - uv.y * 0.55 - 0.18) * 2.5, 2.0)) * 0.26;

      // 銀河核心光暈
      float core = exp(-pow(length(uv - vec2(0.50, 0.50)) * 3.4, 2.0)) * 0.20;

      // 三層星點（細密背景 → 中等 → 稀疏亮星），各層以不同速度緩慢漂移（視差）
      vec2 drift1 = vec2(t * 0.0055,  t * 0.0030);
      vec2 drift2 = vec2(t * 0.0038,  t * 0.0020);
      vec2 drift3 = vec2(t * 0.0018,  t * 0.0010);
      float sf1 = starField(uv + drift1, 32.0, 0.04, 1.4, 0.00);
      float sf2 = starField(uv + drift2, 15.0, 0.04, 0.9, 1.73);
      float sf3 = starField(uv + drift3,  6.0, 0.03, 0.5, 3.31);
      float allStars = sf1 * 0.55 + sf2 * 0.90 + sf3 * 1.40;

      // 星雲顏色混合
      vec3 nebulaCol = vec3(0.16, 0.11, 0.24) * n1    // 低飽灰紫
                     + vec3(0.08, 0.10, 0.20) * n2     // 暗藍灰
                     + vec3(0.20, 0.11, 0.15) * n3;    // 煙燻玫瑰

      col = clamp(nebulaCol
                + vec3(0.10, 0.09, 0.17) * band
                + vec3(0.13, 0.11, 0.22) * core
                + vec3(0.80, 0.83, 0.90) * allStars, 0.0, 1.0);

      float nebulaA = clamp(n1*0.78 + n2*0.68 + n3*0.52 + band*0.52 + core*0.55, 0.0, 1.0);
      alpha = clamp(max(nebulaA, allStars * 2.8), 0.0, 0.92);
    }

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[useTextureWebGL] compile:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function useTextureWebGL(
  canvasRef: Ref<HTMLCanvasElement | null>,
  mood: Ref<string | null>,
) {
  let gl: WebGLRenderingContext | null = null
  let program: WebGLProgram | null = null
  let uMood: WebGLUniformLocation | null = null
  let uRes: WebGLUniformLocation | null = null
  let uTime: WebGLUniformLocation | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let rafId = 0
  let activeMood: string | null = null
  let t0 = 0   // performance.now() 基準，讓每個情緒從 t=0 開始計時

  function initGL(canvas: HTMLCanvasElement): boolean {
    const ctx = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!ctx) return false
    gl = ctx

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT)
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vert || !frag) return false

    program = gl.createProgram()
    if (!program) return false
    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[useTextureWebGL] link:', gl.getProgramInfoLog(program))
      return false
    }

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    uMood = gl.getUniformLocation(program, 'u_mood')
    uRes = gl.getUniformLocation(program, 'u_res')
    uTime = gl.getUniformLocation(program, 'u_time')

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    return true
  }

  function resize() {
    const canvas = canvasRef.value
    if (!canvas || !gl) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  // 持續動畫迴圈：有 activeMood 才繪製，否則只佔位
  function loop(ts: number) {
    if (activeMood && gl && program) {
      gl.useProgram(program)
      gl.uniform2f(uRes, gl.canvas.width, gl.canvas.height)
      gl.uniform1i(uMood, MOOD_INDICES[activeMood] ?? 0)
      gl.uniform1f(uTime, (ts - t0) / 1000)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    rafId = requestAnimationFrame(loop)
  }

  watch(mood, (newMood) => {
    if (timer) clearTimeout(timer)
    const canvas = canvasRef.value
    if (!canvas) return

    if (!newMood) {
      canvas.style.opacity = '0'
      activeMood = null
      return
    }

    const cur = parseFloat(canvas.style.opacity || '0')
    if (cur > 0.1) {
      // 已有紋理：先淡出 → 切換情緒 → 淡入
      canvas.style.opacity = '0'
      timer = setTimeout(() => {
        activeMood = newMood
        t0 = performance.now()
        canvas.style.opacity = '1'
      }, 300)
    }
    else {
      activeMood = newMood
      t0 = performance.now()
      canvas.style.opacity = '1'
    }
  })

  const onResize = () => resize()   // loop 自動讀取新的 canvas 尺寸

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    if (!initGL(canvas)) return
    resize()
    t0 = performance.now()
    rafId = requestAnimationFrame(loop)
    window.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
  })
}
