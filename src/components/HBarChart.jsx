import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// アニメーションは無効（requestAnimationFrame が止まる環境では図形が0サイズのまま残るため。各グラフ共通）
// 横棒グラフ。項目名の幅を固定するとカードが狭いときに描画領域が0になり棒が消えるため、
// 実際の幅を測って項目名の幅を最大40%に抑え、はみ出す名前は省略する
const HBarChart = ({ data, height, fill, fontSize = 12, labelFontSize = fontSize, radius = 4, tooltip }) => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const longest = Math.max(1, ...data.map((d) => String(d.name).length));
  const yWidth = Math.min(longest * fontSize + 12, Math.floor(width * 0.4));
  const maxChars = Math.max(2, Math.floor((yWidth - 12) / fontSize));
  const formatTick = (v) => {
    const s = String(v);
    return s.length > maxChars ? `${s.slice(0, maxChars - 1)}…` : s;
  };

  return (
    <div ref={ref} style={{ width: '100%', minWidth: 0, height }}>
      {width > 0 && (
        <BarChart width={width} height={height} data={data} layout="vertical"
          margin={{ top: 4, right: labelFontSize * 3, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef" horizontal={false} />
          <XAxis type="number" tick={{ fontSize }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize }} width={yWidth} interval={0} tickFormatter={formatTick} />
          <Tooltip content={tooltip} />
          <Bar isAnimationActive={false} dataKey="value" fill={fill} radius={[0, radius, radius, 0]}
            label={{ position: 'right', fontSize: labelFontSize, fill: '#1a3a5c', fontWeight: 700 }} />
        </BarChart>
      )}
    </div>
  );
};

export default HBarChart;
