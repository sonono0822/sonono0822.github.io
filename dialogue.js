"use strict";
// Original app dialogue. No extra timers, network or persisted history.
const DIALOGUE = (() => {
  const lines = {
    weekday: {
      morning: ['まずは今日の順序を決めなさい。','急ぐ前に手順を確かめて。','朝のうちに一つ片づけよう。','始める前に水を一口。','すべてを急ぐ必要はない。最初の一つを確実に。'],
      lateMorning: ['手を止めて肩を休めなさい。','順調でも確認は怠らずに。','作業は一つずつ進めよう。','集中するほど休憩を忘れずに。','一区切りついたら目を休めて。続きはそのあとでいい。'],
      day: ['午後は無理のない速さで。','次に進む前にひと息。','作業の合間に水を飲みなさい。','慌てず目の前の一つから。','少し席を離れてもいい。戻ってから順に片づけよう。'],
      evening: ['今日の作業に区切りを。','残りは落ち着いて確かめよう。','片づけが済んだら休みなさい。','続ける前に疲れを確かめて。','ここまで進めたのなら十分だ。終える時間も大切に。'],
      night: ['夜は静かに過ごそう。','温かいものでも飲みなさい。','肩の力を抜いていい。','少し目を休めておいで。','今は急がなくていい。自分のための時間を取りなさい。'],
      deepNight: ['もう遅い。そろそろ休みなさい。','眠る支度はできているか。','目を閉じて呼吸を整えて。','夜更かしもほどほどに。','静かな時間だな。だが眠りまで削る必要はない。']
    },
    rest: {
      morning: ['朝はゆっくりでいい。','温かい飲み物から始めよう。','窓の外を少し眺めていよう。','まずは穏やかなひと息を。','慌てなくていい。朝の静けさをもう少し楽しもう。'],
      lateMorning: ['好きな本でも開いてみるか。','お茶にするにはいい頃合いだ。','今日はのんびり過ごそう。','何も決めない時間も悪くない。','少し遠くを眺めてごらん。目も気持ちも休ませて。'],
      day: ['昼下がりは静かに過ごそう。','好きな音楽でも聴くといい。','水を一口。忘れてはいないか。','心地よい速さで過ごしなさい。','眠ければ少し目を閉じてもいい。ここでは急がなくていい。'],
      evening: ['夕暮れを少し眺めていよう。','そろそろ温かいお茶を。','穏やかな夜にしよう。','夕食はゆっくり味わって。','空の色が変わっていくな。もう少しここにいよう。'],
      night: ['今夜は何を読もうか。','静かな夜も悪くない。','くつろげる場所で過ごしなさい。','温かい飲み物が似合う時間だ。','何もしない時間にも意味はある。今はゆっくりしていなさい。'],
      deepNight: ['夜は長いが休息も必要だ。','そろそろ明かりを落とそう。','眠れそうなら休みなさい。','冷えないようにしておいで。','まだ起きていたのか。無理はせず眠れるときに眠りなさい。']
    }
  };
  let lastKey = '';
  const recent = [];
  function dayType(date) {
    // Unknown holiday years are treated conservatively: no work-related lines.
    if (date.getDay() === 0 || date.getDay() === 6 || typeof JAPAN_HOLIDAYS === 'undefined') return 'rest';
    const year = date.getFullYear();
    return year < JAPAN_HOLIDAYS.firstYear || year > JAPAN_HOLIDAYS.lastYear || JAPAN_HOLIDAYS.has(date) ? 'rest' : 'weekday';
  }
  function sync(date, scene) {
    if (!Object.prototype.hasOwnProperty.call(lines.weekday, scene)) return;
    const type = dayType(date);
    // A wall-clock hour handles midnight, wakeup and clock changes without catch-up loops.
    const key = `${Math.floor(date.getTime()/3600000)}:${type}:${scene}`;
    if (key === lastKey) return;
    const choices = lines[type][scene].filter(line => !recent.includes(line));
    const text = choices[Math.floor(Math.random()*choices.length)];
    document.querySelector('#bubble').textContent = text;
    recent.push(text);
    if (recent.length > 3) recent.shift();
    lastKey = key;
  }
  return Object.freeze({sync});
})();
