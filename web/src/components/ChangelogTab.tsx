import { useTranslation } from 'react-i18next'

interface ChangelogEntry {
  date: string
  items: string[]
}

export default function ChangelogTab() {
  const { t } = useTranslation()
  const entries = t('changelog.entries', { returnObjects: true }) as ChangelogEntry[]

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', lineHeight: 1.85 }}>
      <section>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{t('changelog.title')}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <tbody>
            {entries.map((entry) =>
              entry.items.map((item, i) => (
                <tr key={`${entry.date}-${i}`}>
                  <td style={{
                    padding: '10px 16px 10px 0',
                    borderBottom: '1px solid #243447',
                    color: '#8fa8c0',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'top',
                    width: 120,
                  }}>
                    {i === 0 ? entry.date : ''}
                  </td>
                  <td style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #243447',
                    color: '#d8e4ef',
                  }}>
                    {item}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
