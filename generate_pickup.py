"""
wouca PickupMovie 生成スクリプト
日別DB (all_history_2026.json) から Movie タイプの動画を抽出し、
直近7日間の再生数上昇率上位5件を wouca_pickup.json に出力する。
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timedelta

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

PFR_JSON  = Path(__file__).parent.parent / 'RKMusic_AllSinger_PFR' / 'all_history_2026.json'
OUTPUT    = Path(__file__).parent / 'wouca_pickup.json'
SINGER    = 'wouca'
TOP_N     = 5
DAYS      = 7

def main():
    with open(PFR_JSON, encoding='utf-8') as f:
        data = json.load(f)

    singer_data = data[SINGER]
    results = []

    for vid_id, vid in singer_data.items():
        if vid_id == '_channel_stats':
            continue
        if vid.get('type') != 'Movie':
            continue

        records = vid.get('records', {})
        if not records:
            continue

        dates = sorted(records.keys())
        if len(dates) < 2:
            continue

        latest_date  = dates[-1]
        latest_views = records[latest_date].get('再生数', 0)

        # 再生数0（メンバー限定など）は除外
        if latest_views == 0:
            continue

        # 7日前に最も近い過去日を探す
        target_date = (
            datetime.strptime(latest_date, '%Y-%m-%d') - timedelta(days=DAYS)
        ).strftime('%Y-%m-%d')

        past_date = None
        for d in reversed(dates[:-1]):
            if d <= target_date:
                past_date = d
                break
        if past_date is None:
            past_date = dates[0]

        past_views = records[past_date].get('再生数', 0)
        if past_views == 0:
            continue

        increase_rate = (latest_views - past_views) / past_views * 100

        results.append({
            'video_id':     vid_id,
            'title':        vid.get('タイトル', ''),
            'published':    vid.get('公開日', ''),
            'latest_views': latest_views,
            'increase_rate': round(increase_rate, 2),
        })

    results.sort(key=lambda x: x['increase_rate'], reverse=True)
    top = results[:TOP_N]

    output = {
        'generated':   datetime.today().strftime('%Y-%m-%d'),
        'period_days': DAYS,
        'pickup':      top,
    }

    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f'完了: {len(top)} 件出力 → {OUTPUT}')
    for v in top:
        print(f"  [{v['increase_rate']:+.1f}%] {v['video_id']} : {v['title'][:40]}")

if __name__ == '__main__':
    main()
