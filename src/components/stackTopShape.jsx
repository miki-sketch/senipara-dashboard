import { Rectangle } from 'recharts';

// 積み上げの最上段（紙）用。Recharts は幅0の棒を描画対象から外し、その段の合計ラベルも消えるため、
// shape を指定して0件でも残す（0件なら何も描かず、ラベルの位置だけ使う）
export const stackTopShape = (radius) => (props) =>
  props.width > 0 && props.height > 0 ? <Rectangle {...props} radius={radius} /> : <g />;
