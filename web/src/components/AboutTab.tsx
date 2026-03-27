import { useTranslation, Trans } from 'react-i18next'

export default function AboutTab() {
  const { t } = useTranslation()

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', lineHeight: 1.85, color: '#c0c0c0' }}>

      <section style={{ marginBottom: 40 }}>
        <h3 style={{ color: '#6b9fd4', fontSize: '1.1rem' }}>{t('about.siteTitle')}</h3>
        <p>{t('about.siteDesc1')}</p>
        <p>
          <Trans
            i18nKey="about.siteDesc2"
            components={{
              link: <a href="https://x.com/WL_GE_inn" target="_blank" rel="noopener noreferrer" />,
            }}
          />
        </p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>{t('about.siteNote')}</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h3 style={{ color: '#6b9fd4', fontSize: '1.1rem' }}>{t('about.purposeTitle')}</h3>
        <p>{t('about.purposeDesc')}</p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h3 style={{ color: '#6b9fd4', fontSize: '1.1rem' }}>{t('about.howTitle')}</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ background: '#161616', border: '1px solid #222', borderRadius: 8, padding: '14px 18px' }}>
            <div style={{ fontWeight: 700, color: '#6b9fd4', marginBottom: 6, fontSize: '0.95rem' }}>
              {t('about.howStreamsTitle')}
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0a0' }}>
              {t('about.howStreamsDesc')}
            </p>
          </div>
          <div style={{ background: '#161616', border: '1px solid #222', borderRadius: 8, padding: '14px 18px' }}>
            <div style={{ fontWeight: 700, color: '#6b9fd4', marginBottom: 6, fontSize: '0.95rem' }}>
              {t('about.howSongsTitle')}
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0a0' }}>
              {t('about.howSongsDesc')}
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h3 style={{ color: '#6b9fd4', fontSize: '1.1rem' }}>{t('about.dataTitle')}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', color: '#a0a0a0' }}>
          <tbody>
            {([
              [t('about.dataFormat'),   t('about.dataFormatVal')],
              [t('about.dataUpdate'),   t('about.dataUpdateVal')],
              [t('about.dataCoverage'), t('about.dataCoverageVal')],
              [t('about.dataCollab'),   t('about.dataCollabVal')],
            ] as [string, string][]).map(([k, v]) => (
              <tr key={k}>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #1e1e1e', color: '#606060', whiteSpace: 'nowrap', width: 160 }}>{k}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #1e1e1e' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h3 style={{ color: '#6b9fd4', fontSize: '1.1rem' }}>{t('about.linksTitle')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href="https://www.youtube.com/@Mikage_RKMusic" target="_blank" rel="noopener noreferrer" style={{ color: '#6b9fd4', fontSize: '0.95rem' }}>
            {t('about.linkYt')}
          </a>
          <a href="https://twitter.com/Mikage_0916" target="_blank" rel="noopener noreferrer" style={{ color: '#6b9fd4', fontSize: '0.95rem' }}>
            {t('about.linkX')}
          </a>
        </div>
      </section>

      <section>
        <h3 style={{ color: '#6b9fd4', fontSize: '1.1rem' }}>{t('about.disclaimerTitle')}</h3>
        <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.8 }}>
          {t('about.disclaimerText')}
        </p>
      </section>

    </div>
  )
}
