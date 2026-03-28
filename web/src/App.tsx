import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StreamingRecord } from './types'
import { parseCSV, parseSongMaster } from './utils/csv'
import { setLanguage } from './i18n'
import StreamsTab from './components/StreamsTab'
import SongsTab from './components/SongsTab'
import AboutTab from './components/AboutTab'
import ChangelogTab from './components/ChangelogTab'
import './App.css'

const STREAMING_CSV_URL =
  import.meta.env.VITE_CSV_URL ??
  'https://raw.githubusercontent.com/Kinshutei/unofficial_uwoter_no_oheya/main/streaminginfo_wouca.csv'

const SONG_MASTER_URL =
  import.meta.env.VITE_MASTER_URL ??
  'https://raw.githubusercontent.com/Kinshutei/unofficial_uwoter_no_oheya/main/rkmusic_song_master.csv'

const PICKUP_URL =
  'https://raw.githubusercontent.com/Kinshutei/unofficial_uwoter_no_oheya/main/wouca_pickup.json'

const NEW_RELEASE_URL =
  'https://raw.githubusercontent.com/Kinshutei/unofficial_uwoter_no_oheya/main/wouca_new_release.json'

type ContentTab = 'streams' | 'songs' | null
type ModalType  = null | 'about' | 'changelog'

interface PickupVideo {
  video_id:      string
  title:         string
  published?:    string
  increase_rate?: number
  note?:         string
  updated?:      string
  isNewRelease?: boolean
}

const LANGS = [
  { value: 'ja',    label: 'JA' },
  { value: 'en',    label: 'EN' },
  { value: 'ko',    label: 'KR' },
  { value: 'zh-TW', label: 'TW' },
]

const LOGO_URL = `${import.meta.env.BASE_URL}uwo_ter_room_icon.png`
const VIDEOS = [
  `${import.meta.env.BASE_URL}wouca_moviecard_01.mp4`,
  `${import.meta.env.BASE_URL}wouca_moviecard_02.mp4`,
  `${import.meta.env.BASE_URL}wouca_moviecard_03.mp4`,
]
const FADE_BEFORE = 1.2 // 動画終了 n 秒前にフェード開始

export default function App() {
  const { t } = useTranslation()

  const [records,     setRecords]     = useState<StreamingRecord[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [activeTab,   setActiveTab]   = useState<ContentTab>(null)
  const [modal,       setModal]       = useState<ModalType>(null)
  const [pickup,      setPickup]      = useState<PickupVideo[]>([])
  const [newRelease,  setNewRelease]  = useState<PickupVideo | null>(null)
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    const stored = localStorage.getItem('lang') ?? ''
    return LANGS.some(l => l.value === stored) ? stored : 'ja'
  })

  const videoARef     = useRef<HTMLVideoElement>(null)
  const videoBRef     = useRef<HTMLVideoElement>(null)
  const indexRef      = useRef(0)
  const activeRef     = useRef<'a' | 'b'>('a')
const canvasRef     = useRef<HTMLCanvasElement>(null)
  const mouseRef      = useRef<{ x: number; y: number } | null>(null)
  const glitchAnimRef = useRef<number>(0)

  /* ── CSV データ取得 ── */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [masterRes, streamRes] = await Promise.all([
          fetch(SONG_MASTER_URL),
          fetch(STREAMING_CSV_URL),
        ])
        if (!masterRes.ok) throw new Error(`song_master HTTP ${masterRes.status}`)
        if (!streamRes.ok) throw new Error(`streaming_info HTTP ${streamRes.status}`)
        const [masterText, streamText] = await Promise.all([
          masterRes.text(),
          streamRes.text(),
        ])
        setRecords(parseCSV(streamText, parseSongMaster(masterText)))
      } catch (e: unknown) {
        setError(String(e))
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  /* ── ピックアップデータ取得 ── */
  useEffect(() => {
    fetch(PICKUP_URL)
      .then(r => r.json())
      .then(d => setPickup(d.pickup || []))
      .catch(() => {})
    fetch(NEW_RELEASE_URL)
      .then(r => r.json())
      .then(d => setNewRelease({ ...d, isNewRelease: true }))
      .catch(() => {})
  }, [])

  /* ── ヒーロー動画：クロスフェード順番再生 ── */
  useEffect(() => {
    const videoA = videoARef.current
    const videoB = videoBRef.current
    if (!videoA || !videoB) return

    const FADE_MS = 1500

    videoA.style.opacity = '1'
    videoB.style.opacity = '0'
    videoA.playbackRate = 0.5
    videoB.playbackRate = 0.5

    let transitioning = false

    const onTimeUpdate = (e: Event) => {
      if (transitioning) return
      const isA     = e.target === videoA
      const current = isA ? videoA : videoB
      const next    = isA ? videoB : videoA
      if ((activeRef.current === 'a') !== isA) return
      if (!current.duration || isNaN(current.duration)) return
      if (current.duration - current.currentTime > FADE_BEFORE) return

      transitioning = true
      const nextIndex = (indexRef.current + 1) % VIDEOS.length

      next.src = VIDEOS[nextIndex]
      next.load()
      next.play().catch(() => {})
      next.playbackRate = 0.5

      current.style.opacity = '0'
      next.style.opacity    = '1'

      setTimeout(() => {
        current.pause()
        indexRef.current  = nextIndex
        activeRef.current = isA ? 'b' : 'a'
        transitioning     = false
      }, FADE_MS)
    }

    videoA.addEventListener('timeupdate', onTimeUpdate)
    videoB.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      videoA.removeEventListener('timeupdate', onTimeUpdate)
      videoB.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [])

  /* ── グリッチエフェクト ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const GLITCH_BOX = 120 // マウス中心からの±px

    let frameCount = 0
    const draw = () => {
      frameCount++
      if (frameCount % 3 === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const mouse = mouseRef.current
        if (mouse) {
          const videoEl = activeRef.current === 'a' ? videoARef.current : videoBRef.current
          if (videoEl && videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
            const rx = videoEl.videoWidth  / canvas.width
            const ry = videoEl.videoHeight / canvas.height
            const count = 15 + Math.floor(Math.random() * 10)

            ctx.save()
            ctx.beginPath()
            ctx.rect(
              mouse.x - GLITCH_BOX,
              mouse.y - GLITCH_BOX,
              GLITCH_BOX * 2,
              GLITCH_BOX * 2,
            )
            ctx.clip()

            for (let i = 0; i < count; i++) {
              const size  = 20 + Math.random() * 80
              const dstX  = mouse.x + (Math.random() - 0.5) * GLITCH_BOX * 1.5 - size / 2
              const dstY  = mouse.y + (Math.random() - 0.5) * GLITCH_BOX * 1.5 - size / 2
              const srcX  = Math.max(0, dstX * rx + (Math.random() - 0.5) * 60)
              const srcY  = Math.max(0, dstY * ry)
              ctx.globalAlpha = 0.5 + Math.random() * 0.5
              ctx.drawImage(videoEl, srcX, srcY, size * rx, size * ry, dstX, dstY, size, size)
            }

            ctx.restore()
          }
        }
      }
      glitchAnimRef.current = requestAnimationFrame(draw)
    }

    glitchAnimRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(glitchAnimRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleTabClick = (tab: ContentTab) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogoClick = () => {
    setActiveTab(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const allPickup: PickupVideo[] = [
    ...(newRelease ? [newRelease] : []),
    ...pickup,
  ]

  return (
    <>
      {/* ── ヘッダー ── */}
      <header className="site-header">
        <div className="header-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src={LOGO_URL} alt="wouca" className="logo-img" />
        </div>
        <nav className="header-nav">
          <a
            href="https://x.com/WL_GE_inn"
            target="_blank"
            rel="noopener noreferrer"
            className="header-nav-link"
          >
            CONTACT
          </a>
          <button
            className={`header-nav-link header-nav-btn${modal === 'about' ? ' active' : ''}`}
            onClick={() => setModal(modal === 'about' ? null : 'about')}
          >
            About
          </button>
          <button
            className={`header-nav-link header-nav-btn${modal === 'changelog' ? ' active' : ''}`}
            onClick={() => setModal(modal === 'changelog' ? null : 'changelog')}
          >
            {t('tab.changelog')}
          </button>
        </nav>
        <div className="header-lang">
          {LANGS.map(l => (
            <button
              key={l.value}
              className={`lang-btn${selectedLang === l.value ? ' active' : ''}`}
              onClick={() => { setSelectedLang(l.value); setLanguage(l.value) }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── ランディングページ（タブ未選択時のみ） ── */}
      {activeTab === null && (
        <>
          <section
            className="hero-section"
            onMouseMove={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
            }}
            onMouseLeave={() => { mouseRef.current = null }}
            onContextMenu={e => e.preventDefault()}
          >
            <video ref={videoARef} className="hero-video" src={VIDEOS[0]} autoPlay muted playsInline />
            <video ref={videoBRef} className="hero-video" muted playsInline />
            <canvas ref={canvasRef} className="hero-glitch-canvas" />
          </section>

          {/* ── フィルター / タブ ── */}
          <section className="filter-section">
            <div className="filter-left">
              <p className="filter-tagline"><span className="filter-tagline-prefix"><span>+</span><span>++</span></span>unofficial / uwo_ter's aquarium</p>
              <p className="filter-sub">We love wouca / everybody's crazy about her</p>
            </div>
            <div className="filter-right">
              <button
                className="filter-item"
                onClick={() => handleTabClick('streams')}
              >
                <span className="filter-item-name">LiveStreaming Info</span>
              </button>
              <button
                className="filter-item"
                onClick={() => handleTabClick('songs')}
              >
                <span className="filter-item-name">Sung Repertoire</span>
              </button>
              <a
                href="https://shop.reality-studios.inc/collections/wouca"
                target="_blank"
                rel="noopener noreferrer"
                className="filter-item filter-item-link"
              >
                <span className="filter-item-name">Official SHOP LINK</span>
                <span className="filter-item-arrow">↗</span>
              </a>
              <a
                href="https://rkmusic.booth.pm/item_lists/nqXTgA1O"
                target="_blank"
                rel="noopener noreferrer"
                className="filter-item filter-item-link"
              >
                <span className="filter-item-name">BOOTH LINK</span>
                <span className="filter-item-arrow">↗</span>
              </a>
            </div>
          </section>

          {/* ── ピックアップ Movie ── */}
          {allPickup.length > 0 && (
            <section className="pickup-section">
              <h2 className="pickup-heading">PICKUP contents</h2>
              <div className="pickup-grid">
                {allPickup.map(v => (
                  <div
                    key={v.video_id}
                    className={`pickup-card${v.isNewRelease ? ' new-release' : ''}`}
                  >
                    {v.isNewRelease && (
                      <span className="new-release-badge">PICKUP!!!</span>
                    )}
                    <div className="pickup-embed-wrap">
                      <iframe
                        className="pickup-embed"
                        src={`https://www.youtube.com/embed/${v.video_id}`}
                        title={v.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <p className="pickup-card-title">{v.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── コンテンツページ（タブ選択時） ── */}
      {activeTab !== null && (
        <main className="main-content">
          {loading && <p className="status-text">{t('loading')}</p>}
          {error   && <p className="status-text error">{t('error', { error })}</p>}
          {!loading && !error && activeTab === 'streams' && <StreamsTab records={records} />}
          {!loading && !error && activeTab === 'songs'   && <SongsTab   records={records} />}
        </main>
      )}

      {/* ── モーダル（About / 更新履歴） ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="modal-body">
              {modal === 'about' ? <AboutTab /> : <ChangelogTab />}
            </div>
          </div>
        </div>
      )}

    </>
  )
}
