"use strict";
// Original app dialogue. No extra timers, network or persisted history.
const DIALOGUE = (() => {
  const lines = {
    "weekday": {
      "morning": [
        "朝か。まずは今日やることを整えるといい。",
        "急ぐ必要はない。順番を決めてから始めればいい。",
        "まだ頭が動かないなら、少しずつで構わない。",
        "一日の始まりから力を使い切る必要はない。",
        "飲み物でも用意するといい。始めるのはその後でも遅くない。"
      ],
      "lateMorning": [
        "集中できているなら、そのまま続ければいい。",
        "手を広げすぎるな。一つずつ片づけた方が早い。",
        "少しくらい立ち止まっても、流れはそう簡単には途切れない。",
        "順調そうだな。なら、余計なことは増やさない方がいい。",
        "目が疲れているなら、一度遠くを見るといい。"
      ],
      "day": [
        "午前はここまでだ。一度区切っておくといい。",
        "まだ先は長い。今から急ぐ理由もないだろう。",
        "思うように進まない時ほど、手順を崩さないことだ。",
        "集中が切れたなら、無理に繋ぎ止める必要はない。",
        "一息入れる頃合いだ。休むのも予定のうちだろう。"
      ],
      "evening": [
        "もう夕方だ。残りを見極める頃だな。",
        "全部を今日に押し込む必要はない。区切りは必要だ。",
        "ここまで進んだなら、あとは整えて終えればいい。",
        "焦って雑になるくらいなら、少し残す方がましだ。",
        "集中が落ちてきたようなら、無理に抗わなくていい。"
      ],
      "night": [
        "今日のことをいつまでも引きずる必要はない。",
        "もう力を抜いていい時間だ。",
        "まだ何かするなら、ほどほどにしておくことだ。",
        "静かな時間くらい、静かに過ごせばいい。",
        "温かい飲み物でもあれば、少しは落ち着くだろう。"
      ],
      "deepNight": [
        "ずいぶん遅い時間だな。そろそろ終わりにしてもいい頃だ。",
        "夜更かしにも限度はある。明日に響かせるほどの価値はない。",
        "まだ起きているのか。少なくとも目くらいは休ませるといい。",
        "続きは明日でも逃げない。今日はここまででいい。",
        "眠れるなら眠っておけ。朝になって困るのは自分だからな。"
      ]
    },
    "rest": {
      "morning": [
        "せっかくの朝だ。急いで始める必要はない。",
        "予定がないなら、それも悪くない過ごし方だ。",
        "まだゆっくりしていていい時間だろう。",
        "朝から予定を詰め込む必要もない。気が向いたところからでいい。",
        "飲み物でも用意してから考えればいい。今日はそれくらいで十分だ。"
      ],
      "lateMorning": [
        "のんびりしているな。今日はそれでいい。",
        "何もしない時間まで埋める必要はないだろう。",
        "気になることがあるなら、気が向いた時に手をつければいい。",
        "時間はある。わざわざ急ぐ理由もない。",
        "少し外を見るくらいの余裕は持っておくといい。"
      ],
      "day": [
        "今日は時間に追われる日ではない。好きに過ごせばいい。",
        "午前を何となく過ごした？　別に問題はないだろう。",
        "予定通りでなくても構わない。休日まで几帳面でいる必要はない。",
        "気分が乗らないなら、何かを始めなくてもいい。",
        "少し休んでから決めればいい。今日はそういう余裕がある。"
      ],
      "evening": [
        "もう夕方か。休日は時間が過ぎるのが妙に早いな。",
        "今日できなかったことを数える必要はない。",
        "まだ何かしたいならすればいい。休みたいなら、それも同じくらい正しい。",
        "日が傾いてきたな。少しゆっくりするにはちょうどいい。",
        "一日を有意義にしようとしすぎるのも、考えものだ。"
      ],
      "night": [
        "静かな夜だ。好きなように過ごせばいい。",
        "明日のことは明日考えればいい。今から抱える必要はない。",
        "今日が穏やかだったなら、それで十分だろう。",
        "まだ夜はある。だからといって、全部使い切る必要もないが。",
        "好きな飲み物でも用意して、しばらくゆっくりするといい。"
      ],
      "deepNight": [
        "まだ起きているのか。休日とはいえ、ほどほどにしておけ。",
        "夜更かしを止めはしないが、明日の朝に文句を言うのはなしだ。",
        "そろそろ休んでもいい時間だ。続きは明日に回せばいい。",
        "静かだからといって、いつまでも起きている必要はない。",
        "眠気があるなら逆らわなくていい。今日はもう十分だ。"
      ]
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
