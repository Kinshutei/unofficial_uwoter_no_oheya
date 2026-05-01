import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Plot from 'react-plotly.js'
import { StreamingRecord, SongStat } from '../types'
import { aggregateSongs } from '../utils/csv'
import { localizeField } from '../utils/localize'

interface Props {
  records: StreamingRecord[]
}

type SortKey = keyof SongStat
type SortDir = 'asc' | 'desc'

function sortSongs(songs: SongStat[], key: SortKey, dir: SortDir): SongStat[] {
  return [...songs].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    let cmp: number
    if (typeof av === 'number' && typeof bv === 'number') {
      cmp = av - bv
    } else {
      cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'ja')
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

const treeColorscale: [number, string][] = [
  [0.0, '#0f1923'],
  [0.4, '#1a2738'],
  [0.7, '#3b5c8a'],
  [1.0, '#8fa8c0'],
]

// ── 独立コンポーネント（Plotlyインスタンスを分離するため） ──────────────

interface RankingPlotProps {
  top20: SongStat[]
  barColors: string[]
  lang: string
}
function RankingPlot({ top20, barColors, lang }: RankingPlotProps) {
  return (
    <Plot
      data={[{
        type: 'bar',
        orientation: 'h',
        x: top20.map((s) => s.歌唱回数),
        y: top20.map((s) => localizeField(s.楽曲名, s.楽曲名_en, s.楽曲名_ko, s.楽曲名_zh, lang)),
        text: top20.map((s) => String(s.歌唱回数)),
        textposition: 'outside',
        marker: { color: barColors, line: { width: 0 } },
        customdata: top20.map((s) => [localizeField(s.原曲アーティスト, s.原曲アーティスト_en, s.原曲アーティスト_ko, s.原曲アーティスト_zh, lang)]),
        hovertemplate: '<b>%{y}</b><br>%{x}<br>Artist: %{customdata[0]}<extra></extra>',
      }]}
      layout={{
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Noto Sans JP', color: '#8fa8c0', size: 12 },
        yaxis: { autorange: 'reversed', showgrid: false, tickfont: { size: 11, color: '#d8e4ef' }, color: '#8fa8c0' },
        xaxis: { showgrid: true, gridcolor: 'rgba(143,168,192,0.2)', zeroline: false, color: '#6a8099' },
        margin: { l: 160, r: 55, t: 16, b: 10 },
        height: Math.max(380, top20.length * 26),
        dragmode: false,
      }}
      config={{ displayModeBar: false, responsive: true, scrollZoom: false }}
      style={{ width: '100%' }}
      useResizeHandler
    />
  )
}

interface YearPlotProps {
  years: [string, number][]
}
function YearPlot({ years }: YearPlotProps) {
  return (
    <Plot
      data={[{
        type: 'bar',
        x: years.map(([y]) => y),
        y: years.map(([, v]) => v),
        text: years.map(([, v]) => String(v)),
        textposition: 'outside',
        marker: {
          color: years.map(([, v]) => v),
          colorscale: [
            [0.0, '#0f1923'], [0.4, '#1a2738'], [0.7, '#3b5c8a'], [1.0, '#8fa8c0'],
          ],
          line: { width: 0 },
        },
        hovertemplate: '<b>%{x}</b><br>%{y}<extra></extra>',
      }]}
      layout={{
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Noto Sans JP', color: '#8fa8c0', size: 12 },
        xaxis: { showgrid: false, color: '#6a8099', tickangle: -45, tickfont: { size: 11, color: '#d8e4ef' } },
        yaxis: { showgrid: true, gridcolor: 'rgba(143,168,192,0.2)', zeroline: false, color: '#6a8099' },
        margin: { l: 40, r: 20, t: 24, b: 60 },
        height: 320,
        dragmode: false,
      }}
      config={{ displayModeBar: false, responsive: true, scrollZoom: false }}
      style={{ width: '100%' }}
      useResizeHandler
    />
  )
}

interface ArtistPlotProps {
  artists: { count: number; displayName: string }[]
  artistTotal: number
}
function ArtistPlot({ artists, artistTotal }: ArtistPlotProps) {
  return (
    <Plot
      data={[{
        type: 'treemap',
        labels: artists.map((a) => a.displayName),
        parents: artists.map(() => ''),
        values: artists.map((a) => a.count),
        text: artists.map((a) => `${(a.count / artistTotal * 100).toFixed(1)}%`),
        texttemplate: '<b>%{label}</b><br>%{value}<br>%{text}',
        hovertemplate: '<b>%{label}</b><br>%{value} (%{text})<extra></extra>',
        marker: { colors: artists.map((a) => a.count), colorscale: treeColorscale, line: { width: 2, color: '#ffffff' }, pad: { t: 22, l: 4, r: 4, b: 4 } },
      }]}
      layout={{
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'Noto Sans JP', color: '#1a1a1a' },
        margin: { t: 4, l: 0, r: 0, b: 0 },
        height: 420,
        dragmode: false,
      }}
      config={{ displayModeBar: false, responsive: true, scrollZoom: false }}
      style={{ width: '100%' }}
      useResizeHandler
    />
  )
}

// ── メインコンポーネント ──────────────────────────────────────────────────

export default function SongsTab({ records }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const songs: SongStat[] = useMemo(() => aggregateSongs(records), [records])
  const [sortKey, setSortKey] = useState<SortKey>('歌唱回数')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const sortedSongs = useMemo(() => sortSongs(songs, sortKey, sortDir), [songs, sortKey, sortDir])
  const top20 = useMemo(() => songs.slice(0, 20), [songs])

  const COLUMNS: { key: SortKey; label: string }[] = [
    { key: '楽曲名',         label: t('songs.colSong') },
    { key: '原曲アーティスト', label: t('songs.colArtist') },
    { key: '作詞1',          label: t('songs.colLyrics') },
    { key: '作曲1',          label: t('songs.colCompose') },
    { key: '編曲1',          label: t('songs.colArrange') },
    { key: 'リリース日',     label: t('songs.colRelease') },
    { key: '歌唱回数',       label: t('songs.colCount') },
  ]

  const barColors = useMemo(() => {
    const maxCount = top20[0]?.歌唱回数 ?? 1
    return top20.map((s) => `rgba(59,92,138,${0.35 + 0.65 * (s.歌唱回数 / maxCount)})`)
  }, [top20])

  const years = useMemo(() => {
    const yearMap = new Map<string, number>()
    for (const s of songs) {
      if (!s.リリース年) continue
      yearMap.set(s.リリース年, (yearMap.get(s.リリース年) ?? 0) + 1)
    }
    return Array.from(yearMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [songs])

  const { artists, artistTotal } = useMemo(() => {
    const artistMap = new Map<string, { count: number; displayName: string }>()
    for (const s of songs) {
      const jaArtist = s.原曲アーティスト?.trim()
      if (!jaArtist) continue
      const displayArtist = localizeField(s.原曲アーティスト, s.原曲アーティスト_en, s.原曲アーティスト_ko, s.原曲アーティスト_zh, lang)
      const existing = artistMap.get(jaArtist)
      if (existing) {
        existing.count += s.歌唱回数
      } else {
        artistMap.set(jaArtist, { count: s.歌唱回数, displayName: displayArtist })
      }
    }
    const artists = Array.from(artistMap.values()).sort((a, b) => b.count - a.count)
    const artistTotal = artists.reduce((sum, a) => sum + a.count, 0)
    return { artists, artistTotal }
  }, [songs, lang])

  if (records.length === 0) {
    return <p style={{ color: '#8fa8c0', padding: '1rem' }}>{t('songs.empty')}</p>
  }

  const handleHeaderClick = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === '歌唱回数' ? 'desc' : 'asc')
    }
  }

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return <span style={{ color: '#6a8099', marginLeft: 4 }}>⇅</span>
    return <span style={{ color: '#8fa8c0', marginLeft: 4 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
  }

  return (
    <div>
      <div className="songs-table-wrap">
        <table className="songs-table">
          <thead>
            <tr>
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleHeaderClick(key)}
                  style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', background: undefined }}
                >
                  {label}{sortIndicator(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedSongs.map((s, i) => (
              <tr key={i}>
                <td>{localizeField(s.楽曲名, s.楽曲名_en, s.楽曲名_ko, s.楽曲名_zh, lang)}</td>
                <td style={{ color: '#a0b8cc' }}>{localizeField(s.原曲アーティスト, s.原曲アーティスト_en, s.原曲アーティスト_ko, s.原曲アーティスト_zh, lang)}</td>
                <td style={{ color: '#a0b8cc' }}>{s.作詞1}{s.作詞2 && <><br /><span style={{ color: '#8fa8c0' }}>{s.作詞2}</span></>}</td>
                <td style={{ color: '#a0b8cc' }}>{s.作曲1}{s.作曲2 && <><br /><span style={{ color: '#8fa8c0' }}>{s.作曲2}</span></>}</td>
                <td style={{ color: '#a0b8cc' }}>{s.編曲1}{s.編曲2 && <><br /><span style={{ color: '#8fa8c0' }}>{s.編曲2}</span></>}</td>
                <td style={{ color: '#a0b8cc' }}>{s.リリース日}</td>
                <td style={{ textAlign: 'center', fontWeight: 600, color: '#8fa8c0' }}>{s.歌唱回数}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ color: '#555', margin: '0 0 8px' }}>{t('songs.rankingTitle')}</h3>
      <RankingPlot top20={top20} barColors={barColors} lang={lang} />

      {years.length > 0 && (
        <>
          <h3 style={{ color: '#555', margin: '24px 0 8px' }}>{t('songs.yearTitle')}</h3>
          <YearPlot years={years} />
        </>
      )}

      {artists.length > 0 && (
        <>
          <h3 style={{ color: '#555', margin: '24px 0 8px' }}>{t('songs.artistTitle')}</h3>
          <ArtistPlot artists={artists} artistTotal={artistTotal} />
        </>
      )}
    </div>
  )
}
