export default function Footer() {
  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 54,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a1520',
      borderTop: '1px solid #243447',
      fontSize: 13,
      color: '#6a8099',
      letterSpacing: '0.06em',
      fontFamily: '"Noto Sans JP", sans-serif',
      zIndex: 200,
      pointerEvents: 'auto',
    }}>
      <span className="footer-full">
        © 2026{' '}
        <a href="https://x.com/WL_GE_inn" target="_blank" rel="noopener noreferrer"
          style={{ color: '#8fa8c0', textDecoration: 'none' }}>
          金鷲亭
        </a>
        　|　非公式ファンサイト — wouca（RK Music）　|　掲載情報の誤りは{' '}
        <a href="https://x.com/WL_GE_inn" target="_blank" rel="noopener noreferrer"
          style={{ color: '#8fa8c0', textDecoration: 'none' }}>
          @WL_GE_inn
        </a>{' '}
        までお気軽にどうぞ
      </span>
      <span className="footer-short">
        © 2026 金鷲亭　|　wouca（RK Music）非公式ファンサイト
      </span>

      {/* SNSアイコン：右端 */}
      <div className="footer-icons">
        <a
          href="https://www.youtube.com/@wouca"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icon-link"
          aria-label="YouTube"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.45 20.5 12 20.5 12 20.5s7.55 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.75 15.52V8.48L15.5 12l-5.75 3.52z"/>
          </svg>
        </a>
        <a
          href="https://x.com/wouca_rkm"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icon-link"
          aria-label="X (Twitter)"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
          </svg>
        </a>
      </div>
    </footer>
  )
}
