"use strict";
// Original app dialogue. No extra timers, network or persisted history.
const DIALOGUE = (() => {
  const lines = {
    weekday: {
      morning: ['まずは、今日の順序を決めなさい。','急ぐ前に、手順を確かめて。','朝のうちに、一つ片づけよう。','始める前に、水を一口。','すべてを急ぐ必要はない。最初の一つを、確実に。'],
      lateMorning: ['手を止めて、肩を休めなさい。','順調でも、確認は怠らずに。','作業は一つずつ進めよう。','集中するほど、休憩を忘れずに。','一区切りついたら、目を休めて。続きはそのあとでいい。'],
      day: ['午後は、無理のない速さで。','次に進む前に、ひと息。','作業の合間に、水を飲みなさい。','慌てず、目の前の一つから。','少し席を離れてもいい。戻ってから、順に片づけよう。'],
      evening: ['今日の作業に、区切りを。','残りは、落ち着いて確かめよう。','片づけが済んだら、休みなさい。','続ける前に、疲れを確かめて。','ここまで進めたのなら十分だ。終える時間も、大切に。'],
      night: ['夜は、静かに過ごそう。','温かいものでも飲みなさい。','肩の力を抜いていい。','少し目を休めておいで。','今は、急がなくていい。自分のための時間を取りなさい。'],
      deepNight: ['もう遅い。そろそろ休みなさい。','眠る支度は、できているか。','目を閉じて、呼吸を整えて。','夜更かしも、ほどほどに。','静かな時間だな。だが、眠りまで削る必要はない。']
    },
    rest: {
      morning: ['朝は、ゆっくりでいい。','温かい飲み物から始めよう。','窓の外を、少し眺めていよう。','まずは、穏やかなひと息を。','慌てなくていい。朝の静けさを、もう少し楽しもう。'],
      lateMorning: ['好きな本でも、開いてみるか。','お茶にするには、いい頃合いだ。','今日は、のんびり過ごそう。','何も決めない時間も悪くない。','少し遠くを眺めてごらん。目も気持ちも、休ませて。'],
      day: ['昼下がりは、静かに過ごそう。','好きな音楽でも、聴くといい。','水を一口。忘れてはいないか。','心地よい速さで過ごしなさい。','眠ければ、少し目を閉じてもいい。ここでは、急がなくていい。'],
      evening: ['夕暮れを、少し眺めていよう。','そろそろ、温かいお茶を。','穏やかな夜にしよう。','夕食は、ゆっくり味わって。','空の色が変わっていくな。もう少し、ここにいよう。'],
      night: ['今夜は、何を読もうか。','静かな夜も、悪くない。','くつろげる場所で過ごしなさい。','温かい飲み物が似合う時間だ。','何もしない時間にも、意味はある。今は、ゆっくりしていなさい。'],
      deepNight: ['夜は長いが、休息も必要だ。','そろそろ、明かりを落とそう。','眠れそうなら、休みなさい。','冷えないようにしておいで。','まだ起きていたのか。無理はせず、眠れるときに眠りなさい。']
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
