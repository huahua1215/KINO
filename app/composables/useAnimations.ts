import { gsap } from 'gsap'

export function useAnimations() {
  // 卡片進場 stagger 動畫
  function animateCardsIn(selector: string | Element[], delay = 0) {
    const targets = typeof selector === 'string'
      ? document.querySelectorAll(selector)
      : selector

    if (!targets.length) return

    gsap.fromTo(
      targets,
      {
        opacity: 0,
        y: 40,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        delay,
        ease: 'power3.out',
      }
    )
  }

  // 情緒切換轉場（fade + scale）
  function animateMoodTransition(
    container: Element | null,
    onComplete?: () => void
  ) {
    if (!container) {
      onComplete?.()
      return
    }

    gsap.timeline()
      .to(container, {
        opacity: 0,
        scale: 0.97,
        duration: 0.25,
        ease: 'power2.in',
      })
      .call(() => onComplete?.())
      .to(container, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: 'power3.out',
      })
  }

  // Modal 開啟動畫
  function animateModalOpen(overlay: Element | null, panel: Element | null) {
    if (!overlay || !panel) return

    gsap.set(overlay, { display: 'flex', opacity: 0 })
    gsap.set(panel, { y: 60, opacity: 0, scale: 0.95 })

    gsap.timeline()
      .to(overlay, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      .to(panel, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: 'power3.out',
      }, '-=0.1')
  }

  // Modal 關閉動畫
  function animateModalClose(overlay: Element | null, panel: Element | null, onComplete?: () => void) {
    if (!overlay || !panel) {
      onComplete?.()
      return
    }

    gsap.timeline({ onComplete })
      .to(panel, {
        y: 40,
        opacity: 0,
        scale: 0.97,
        duration: 0.25,
        ease: 'power2.in',
      })
      .to(overlay, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      }, '-=0.1')
      .set(overlay, { display: 'none' })
  }

  // 頁面標題入場
  function animateHeroIn(elements: Element[]) {
    gsap.fromTo(
      elements,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
      }
    )
  }

  // Icon 畫出動畫：mouseenter 時用 strokeDashoffset 模擬筆劃描繪效果
  // sequential=true：一條畫完才畫下一條；false：略微 stagger 同時進行
  function addIconDrawAnimation(el: Element, sequential = false) {
    const svg = el.querySelector('svg')
    if (!svg) return () => {}

    const candidates = Array.from(svg.querySelectorAll('path, line, circle, ellipse, polyline'))

    const drawEls: { el: SVGGeometryElement; len: number }[] = []
    const fadeEls: Element[] = []

    candidates.forEach((s) => {
      const fill   = s.getAttribute('fill')   ?? s.parentElement?.getAttribute('fill')   ?? 'none'
      const stroke = s.getAttribute('stroke') ?? s.parentElement?.getAttribute('stroke') ?? 'none'
      const geo = s as SVGGeometryElement

      if (stroke !== 'none' && fill === 'none' && typeof geo.getTotalLength === 'function') {
        try {
          const len = geo.getTotalLength()
          if (len > 0) {
            gsap.set(s, { strokeDasharray: len, strokeDashoffset: 0 })
            drawEls.push({ el: geo, len })
          }
        } catch {}
      } else {
        fadeEls.push(s)
      }
    })

    const PER_EL_DUR = 0.22
    const SEQ_STEP = 0.10

    const enter = () => {
      if (sequential) {
        let delay = 0
        drawEls.forEach(({ el, len }) => {
          gsap.fromTo(el,
            { strokeDashoffset: len },
            { strokeDashoffset: 0, duration: PER_EL_DUR, delay, ease: 'power2.inOut' }
          )
          delay += SEQ_STEP
        })
        fadeEls.forEach((el) => {
          gsap.fromTo(el,
            { opacity: 0 },
            { opacity: 1, duration: PER_EL_DUR, delay, ease: 'power2.out' }
          )
          delay += SEQ_STEP
        })
      } else {
        drawEls.forEach(({ el, len }, i) => {
          gsap.fromTo(el,
            { strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 0.55, delay: i * 0.04, ease: 'power2.inOut' }
          )
        })
        if (fadeEls.length) {
          gsap.fromTo(fadeEls,
            { opacity: 0, scale: 0.5, transformOrigin: '50% 50%' },
            { opacity: 1, scale: 1, duration: 0.3, stagger: 0.06, ease: 'back.out(1.7)' }
          )
        }
      }
    }

    el.addEventListener('mouseenter', enter)
    return () => el.removeEventListener('mouseenter', enter)
  }

  // 情緒按鈕 hover glow 效果（只動 transform，不碰 boxShadow 避免 repaint）
  function addMoodButtonHover(el: Element, _color: string) {
    const enter = () => {
      gsap.to(el, {
        scale: 1.05,
        duration: 0.25,
        ease: 'power2.out',
      })
    }
    const leave = () => {
      gsap.to(el, {
        scale: 1,
        duration: 0.25,
        ease: 'power2.in',
      })
    }

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)

    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }

  return {
    animateCardsIn,
    animateMoodTransition,
    animateModalOpen,
    animateModalClose,
    animateHeroIn,
    addMoodButtonHover,
    addIconDrawAnimation,
  }
}
