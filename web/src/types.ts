export interface SongMaster {
  song_id: string
  楽曲名: string
  楽曲名_en?: string
  楽曲名_ko?: string
  楽曲名_zh?: string
  原曲アーティスト: string
  原曲アーティスト_en?: string
  原曲アーティスト_ko?: string
  原曲アーティスト_zh?: string
  作詞: string
  作曲: string
  リリース日: string
}

export interface StreamingRecord {
  枠名: string
  song_id: string
  楽曲名: string
  楽曲名_en?: string
  楽曲名_ko?: string
  楽曲名_zh?: string
  歌唱順: number
  配信日: string
  枠URL: string
  コラボ相手様: string
  // マスターから JOIN されるフィールド
  原曲Artist: string
  原曲Artist_en?: string
  原曲Artist_ko?: string
  原曲Artist_zh?: string
  作詞: string
  作曲: string
  リリース日: string
}

export interface StreamInfo {
  枠名: string
  配信日: string
  枠URL: string
}

export interface SongStat {
  楽曲名: string
  楽曲名_en?: string
  楽曲名_ko?: string
  楽曲名_zh?: string
  原曲アーティスト: string
  原曲アーティスト_en?: string
  原曲アーティスト_ko?: string
  原曲アーティスト_zh?: string
  作詞: string
  作曲: string
  リリース日: string
  リリース年: string
  歌唱回数: number
}
