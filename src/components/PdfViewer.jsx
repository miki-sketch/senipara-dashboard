import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from '../utils/sheets';

// 原本画像はGAS経由で配信する（GASがオーナー権限で読み出すため、Googleアカウント不要）
const imageUrl = (pw, image) => `${API_URL}?pw=${encodeURIComponent(pw)}&img=${encodeURIComponent(image)}`;

const isMobile = () => window.matchMedia('(max-width: 767.98px)').matches;

// PDF（原本画像）の表示。PCは新しいタブ、モバイルはアプリ内の全画面表示にする。
// モバイルでは履歴を1つ積むので、端末やブラウザの「戻る」でもPDFだけが閉じる
export const usePdfViewer = (pw) => {
  const [url, setUrl] = useState(null);
  const scrollY = useRef(0);

  const openPdf = useCallback((image) => {
    const src = imageUrl(pw, image);
    if (!isMobile()) {
      window.open(src, '_blank', 'noopener');
      return;
    }
    scrollY.current = window.scrollY;
    window.history.pushState({ pdfViewer: true }, '');
    setUrl(src);
  }, [pw]);

  useEffect(() => {
    if (!url) return undefined;
    const onPop = () => setUrl(null);
    window.addEventListener('popstate', onPop);
    // 背面のページをスクロールさせない
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('popstate', onPop);
      document.body.style.overflow = prevOverflow;
      window.scrollTo(0, scrollY.current);
    };
  }, [url]);

  const viewer = url && (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="PDF表示">
      <div style={styles.bar}>
        <button type="button" style={styles.backBtn} onClick={() => window.history.back()}>
          ← 戻る
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" style={styles.extLink}>
          新しいタブで開く
        </a>
      </div>
      <iframe src={url} title="PDF" style={styles.frame} />
    </div>
  );

  return { openPdf, viewer };
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
  },
  bar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '8px 12px',
    paddingTop: 'max(8px, env(safe-area-inset-top))',
    background: '#1a3a5c',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  backBtn: {
    minHeight: 40,
    padding: '6px 16px',
    fontSize: 15,
    fontWeight: 700,
    color: '#1a3a5c',
    background: '#fff',
    border: 'none',
    borderRadius: 20,
    cursor: 'pointer',
  },
  extLink: { fontSize: 12, color: '#cfe0f2' },
  frame: { flex: 1, width: '100%', border: 'none' },
};
