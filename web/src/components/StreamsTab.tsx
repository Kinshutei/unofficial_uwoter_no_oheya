import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StreamingRecord } from '../types'
import { extractYtVideoId } from '../utils/csv'
import { localizeField } from '../utils/localize'

interface Props {
  records: StreamingRecord[]
}

export default function StreamsTab({ records }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [defaultOpen, setDefaultOpen] = useState(false)
  const [mountKey, setMountKey] = useState(0)
  const [query, setQuery] = useState('')

  if (records.length === 0) {
    return <p style={{ color: '#888', padding: '1rem' }}>{t('streams.empty')}</p>
  }

  const trimmedQuery = query.trim()
  const isSearching = trimmedQuery.length > 0
  const q = trimmedQuery.toLowerCase()

  const streams = Array.from(
    new Map(
      records
        .sort((a, b) => b.配信日.localeCompare(a.配信日))
        .map((r) => [`${r.枠名}__${r.配信日}`, { 枠名: r.枠名, 配信日: r.配信日, 枠URL: r.枠URL }])
    ).values()
  )

  const filteredStreams = isSearching
    ? streams.filter((stream) =>
        records
          .filter((r) => r.枠名 === stream.枠名)
          .some((r) => {
            const title  = localizeField(r.楽曲名, r.楽曲名_en, r.楽曲名_ko, r.楽曲名_zh, lang).toLowerCase()
            const artist = localizeField(r.原曲Artist, r.原曲Artist_en, r.原曲Artist_ko, r.原曲Artist_zh, lang).toLowerCase()
            return title.includes(q) || artist.includes(q)
          })
      )
    : streams

  const firstAppearance = new Map<string, { 枠名: string; 歌唱順: number }>()
  const sorted = [...records].sort((a, b) => a.配信日.localeCompare(b.配信日) || a.歌唱順 - b.歌唱順)
  for (const r of sorted) {
    if (!firstAppearance.has(r.楽曲名)) {
      firstAppearance.set(r.楽曲名, { 枠名: r.枠名, 歌唱順: r.歌唱順 })
    }
  }

  const hasCollab = records.some((r) => r.コラボ相手様 && r.コラボ相手様 !== 'なし' && r.コラボ相手様 !== '')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: '100%', maxWidth: '360px' }}>
          <span style={{ position: 'absolute', left: '10px', color: '#606060', fontSize: '14px', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('streams.searchPlaceholder')}
            style={{
              width: '100%',
              padding: '7px 36px 7px 32px',
              border: '1px solid #d8cfc4',
              borderRadius: '20px',
              fontFamily: 'inherit',
              fontSize: '15px',
              outline: 'none',
              background: '#708090',
              color: '#ffffff',
              boxShadow: isSearching ? '0 0 0 2px rgba(138,184,185,0.35)' : undefined,
              borderColor: isSearching ? '#8ab8b9' : '#d8cfc4',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          />
          {isSearching && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute', right: '10px', background: 'none', border: 'none',
                cursor: 'pointer', color: '#aaa', fontSize: '14px', lineHeight: 1, padding: '0',
              }}
              title="クリア"
            >✕</button>
          )}
        </div>
        {isSearching && (
          <span style={{ fontSize: '13px', color: '#606060' }}>
            {t('streams.searchHits', { count: filteredStreams.length })}
          </span>
        )}
        {!isSearching && (
          <>
            <button className="btn-secondary" onClick={() => { setDefaultOpen(true); setMountKey((k) => k + 1) }}>{t('streams.expandAll')}</button>
            <button className="btn-secondary" onClick={() => { setDefaultOpen(false); setMountKey((k) => k + 1) }}>{t('streams.collapseAll')}</button>
          </>
        )}
      </div>

      {filteredStreams.length === 0 && isSearching && (
        <p style={{ color: '#606060', fontSize: '14px' }}>{t('streams.searchNoResults', { query: trimmedQuery })}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filteredStreams.map((stream) => {
          const setlist = records
            .filter((r) => r.枠名 === stream.枠名)
            .filter((r) => {
              if (!isSearching) return true
              const title  = localizeField(r.楽曲名, r.楽曲名_en, r.楽曲名_ko, r.楽曲名_zh, lang).toLowerCase()
              const artist = localizeField(r.原曲Artist, r.原曲Artist_en, r.原曲Artist_ko, r.原曲Artist_zh, lang).toLowerCase()
              return title.includes(q) || artist.includes(q)
            })
            .sort((a, b) => a.歌唱順 - b.歌唱順)
          const videoId = extractYtVideoId(stream.枠URL)
          const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
          const cleanUrl = videoId ? `https://www.youtube.com/live/${videoId}` : stream.枠URL

          const frameHasCollab = hasCollab && setlist.some(
            (r) => r.コラボ相手様 && r.コラボ相手様 !== 'なし' && r.コラボ相手様 !== ''
          )

          return (
            <StreamExpander
              key={`${stream.枠名}_${stream.配信日}_${mountKey}`}
              label={`${stream.配信日}　${stream.枠名}`}
              forceOpen={isSearching}
              defaultOpen={defaultOpen}
              thumbUrl={thumbUrl}
              cleanUrl={cleanUrl}
              setlist={setlist}
              query={trimmedQuery}
              showCollab={frameHasCollab}
              firstAppearance={firstAppearance}
              lang={lang}
            />
          )
        })}
      </div>
    </div>
  )
}

interface ExpanderProps {
  label: string
  forceOpen: boolean
  defaultOpen: boolean
  thumbUrl: string | null
  cleanUrl: string
  setlist: StreamingRecord[]
  query: string
  showCollab: boolean
  firstAppearance: Map<string, { 枠名: string; 歌唱順: number }>
  lang: string
}

function StreamExpander({ label, forceOpen, defaultOpen, thumbUrl, cleanUrl, setlist, query, showCollab, firstAppearance, lang }: ExpanderProps) {
  const { t } = useTranslation()
  const [localOpen, setLocalOpen] = useState(defaultOpen)
  const isOpen = forceOpen || localOpen
  const q = query.toLowerCase()

  return (
    <div className="expander">
      <button
        className="expander-header"
        onClick={() => setLocalOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <span style={{ marginRight: '8px' }}>{isOpen ? '⚜' : '▶'}</span>
        <span dangerouslySetInnerHTML={{ __html: label }} />
      </button>

      <div style={{ maxHeight: isOpen ? '1000px' : '0', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
        <div className="expander-body">
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '16px' }}>
            <div>
              {thumbUrl ? (
                <>
                  <div style={{
                    width: '100%',
                    paddingTop: '56.25%',
                    borderRadius: '6px',
                    backgroundImage: `url(${thumbUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }} />
                  <a href={cleanUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#6b9fd4', display: 'block', marginTop: '4px' }}>
                    {t('streams.openYouTube')}
                  </a>
                </>
              ) : (
                <span style={{ fontSize: '13px', color: '#484848' }}>{t('streams.noThumbnail')}</span>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="setlist-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('streams.colSong')}</th>
                    <th>{t('streams.colNote')}</th>
                    <th>{t('streams.colKey')}</th>
                    <th>{t('streams.colArtist')}</th>
                    {showCollab && <th>{t('streams.colCollab')}</th>}
                    <th>{t('streams.colUrl')}</th>
                  </tr>
                </thead>
                <tbody>
                  {setlist.map((r, i) => {
                    const displayTitle  = localizeField(r.楽曲名, r.楽曲名_en, r.楽曲名_ko, r.楽曲名_zh, lang)
                    const displayArtist = localizeField(r.原曲Artist, r.原曲Artist_en, r.原曲Artist_ko, r.原曲Artist_zh, lang)
                    const hitTitle  = query.length > 0 && displayTitle.toLowerCase().includes(q)
                    const hitArtist = query.length > 0 && displayArtist.toLowerCase().includes(q)
                    const isHit = hitTitle || hitArtist
                    return (
                      <tr key={i} style={isHit ? { backgroundColor: 'rgba(107,159,212,0.12)' } : undefined}>
                        <td>{r.歌唱順}</td>
                        <td style={hitTitle ? { fontWeight: 600, color: '#6b9fd4' } : undefined}>
                          {(() => {
                            const fa = firstAppearance.get(r.楽曲名)
                            const isFirst = fa?.枠名 === r.枠名 && fa?.歌唱順 === r.歌唱順
                            return isFirst ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span style={{
                                  fontSize: 10, fontWeight: 700, color: '#d4a843',
                                  border: '1px solid #d4a843', borderRadius: 3,
                                  padding: '1px 4px', letterSpacing: '0.05em', lineHeight: 1.4,
                                }}>{t('streams.firstBadge')}</span>
                                {displayTitle}
                              </span>
                            ) : displayTitle
                          })()}
                        </td>
                        <td style={{ color: '#aaaaaa', fontSize: '12px' }}>{r.補足情報}</td>
                        <td style={{ color: '#aaaaaa', fontSize: '12px', whiteSpace: 'nowrap' }}>{r.キー}</td>
                        <td style={{ color: hitArtist ? '#6b9fd4' : '#888888', fontWeight: hitArtist ? 600 : undefined }}>{displayArtist}</td>
                        {showCollab && (
                          <td style={{ color: '#888888' }}>{r.コラボ相手様 === 'なし' ? '' : r.コラボ相手様}</td>
                        )}
                        <td>
                          {r.枠URL && (
                            <a href={r.枠URL} target="_blank" rel="noopener noreferrer" style={{ color: '#5a7fa8' }}>
                              {t('streams.openLink')}
                            </a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
