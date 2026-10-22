// Nutritionist persona: pre / during / post fueling, hydration, recovery aids and sleep.
// Carbohydrate figures follow common sports-nutrition ranges (g per kg body weight).

const DAY_CARBS = {
  rest: '3–5 g/kg for the day',
  recovery: '5–6 g/kg for the day',
  easy: '5–7 g/kg for the day',
  strength: '4–6 g/kg for the day',
  crossfit: '4–6 g/kg for the day',
  interval: '6–8 g/kg for the day',
  threshold: '6–8 g/kg for the day',
  long: '7–10 g/kg for the day',
  race: '8–10 g/kg for the day',
}

const PRE = {
  rest: {
    timing: 'Normal breakfast',
    foods: ['Eggs or tofu scramble with toast', 'Oats with fruit', 'Greek yogurt with berries and honey'],
    note: 'A rest day is a rebuilding day. Keep protein evenly spread across 3 to 4 meals.',
  },
  recovery: {
    timing: '30 to 60 minutes before',
    foods: ['Banana', 'One slice of toast with honey', 'Small cup of rice porridge'],
    note: 'About 20 to 30 g of carbohydrate is plenty. This run is easy, so keep it light.',
  },
  easy: {
    timing: '30 to 60 minutes before (60 to 90 minutes if you ate little at lunch)',
    foods: ['Banana and a handful of dates', 'Toast with jam or honey', 'Plain rice cakes with honey'],
    note: '20 to 40 g of carbohydrate. A short easy run in the morning may be done on a light snack only.',
  },
  interval: {
    timing: '2 to 3 hours before, then a small top-up 30 to 45 minutes before',
    foods: [
      'Oatmeal with banana, honey and a pinch of salt plus one egg',
      'White rice with a little chicken and soy sauce',
      'Top-up: half a banana or one energy gel',
    ],
    note: '1.5 to 2 g/kg of carbohydrate, low in fibre and fat so the stomach stays comfortable at speed.',
  },
  threshold: {
    timing: '2 to 3 hours before, then a small top-up 30 to 45 minutes before',
    foods: [
      'Toast or bagel with jam and a banana',
      'Rice with scrambled eggs',
      'Top-up: sports drink sips or a few jelly sweets',
    ],
    note: '1.5 to 2 g/kg of carbohydrate. Practise exactly what you will eat on race day.',
  },
  long: {
    timing: '3 hours before, then 200 to 300 mL fluids and a gel 15 minutes before the start',
    foods: [
      'White rice or oats with banana and honey',
      'Two slices of white toast with jam and a small glass of juice',
      'Bagel with peanut butter (only if tolerated)',
    ],
    note: '2 to 3 g/kg of carbohydrate. This is the long run, so treat it as a dress rehearsal for race day nutrition.',
  },
  strength: {
    timing: '1 to 2 hours before',
    foods: ['Greek yogurt with fruit and granola', 'Toast with peanut butter and banana', 'Rice cake with ham or egg'],
    note: '20 g of protein and 30 to 50 g of carbohydrate. Avoid going to the gym on an empty stomach.',
  },
  crossfit: {
    timing: '1 to 2 hours before',
    foods: ['Banana and a protein yogurt', 'Oats with milk and honey', 'Toast with egg'],
    note: 'Light and carbohydrate-focused so the engine intervals feel strong.',
  },
  race: {
    timing: '3 to 4 hours before, then sports drink sips and an optional gel 15 minutes before the start',
    foods: [
      'Plain white rice, oats or white bagel with honey',
      'Banana and sports drink',
      'Nothing new. Only foods you have trained with.',
    ],
    note: '2 to 3 g/kg of carbohydrate with low fibre, low fat and low protein. Add salt to your breakfast.',
  },
}

const POST = {
  rest: {
    timing: 'Meals as usual',
    foods: ['Colourful vegetables and fruit', 'Lean protein every meal (fish, chicken, eggs, tofu, beans)', 'Whole-grain carbohydrate'],
    note: 'Include omega-3 sources (salmon, sardines, walnuts) and a vitamin C food at one meal.',
  },
  recovery: {
    timing: 'Within 60 minutes',
    foods: ['Chocolate milk or yogurt drink', 'Banana with a handful of nuts', 'Eggs on toast'],
    note: 'Light snack followed by your normal meal. No special recovery protocol is needed.',
  },
  easy: {
    timing: 'Within 60 minutes',
    foods: ['Chocolate milk with a banana', 'Rice bowl with egg and vegetables', 'Smoothie with fruit, milk and oats'],
    note: '1 g/kg of carbohydrate with 20 g of protein. Then your normal meals.',
  },
  interval: {
    timing: 'Within 30 minutes, then a full meal within 2 hours',
    foods: [
      'Chocolate milk (500 mL) and a banana',
      'Rice bowl with chicken or salmon and vegetables',
      'Whey or soy shake with oats and berries',
    ],
    note: '1 to 1.2 g/kg of carbohydrate with 0.3 g/kg of protein (about 20 to 30 g). Fast refuelling lets you train well again tomorrow.',
  },
  threshold: {
    timing: 'Within 30 minutes, then a full meal within 2 hours',
    foods: ['Rice or pasta with chicken, tuna or tofu', 'Yogurt with fruit and honey', 'Chocolate milk and a bagel'],
    note: '1 to 1.2 g/kg of carbohydrate with 20 to 30 g of protein.',
  },
  long: {
    timing: 'Within 30 minutes, then a large meal within 2 hours',
    foods: [
      'Chocolate milk or recovery shake and a banana immediately',
      'Large meal: rice or potato, lean protein, vegetables, olive oil',
      'Pretzels, soup or salted foods to replace sodium',
    ],
    note: '1.2 g/kg of carbohydrate, 25 to 30 g of protein, plus fluids with sodium. Keep eating carbohydrate every 2 hours for 4 to 6 hours.',
  },
  strength: {
    timing: 'Within 60 minutes',
    foods: ['Greek yogurt, fruit and honey', 'Chicken, rice and vegetables', 'Protein shake with milk and a banana'],
    note: '25 to 30 g of protein to maximise muscle repair, plus moderate carbohydrate.',
  },
  crossfit: {
    timing: 'Within 45 minutes',
    foods: ['Rice bowl with egg or chicken', 'Chocolate milk and fruit', 'Smoothie with oats, milk and protein'],
    note: '1 g/kg of carbohydrate and 25 g of protein to refill glycogen and repair muscle.',
  },
  race: {
    timing: 'Within 30 minutes, then eat every 2 hours',
    foods: [
      'Sports drink or chocolate milk and a banana',
      'Salty snacks (pretzels, broth, salted rice)',
      'Big celebratory meal with protein, carbohydrate and vegetables',
    ],
    note: 'Aim for 1.2 g/kg of carbohydrate and 25 to 30 g of protein. Then focus on sleep and fluids.',
  },
}

const RECOVERY_AIDS = {
  rest: ['Sleep 8 to 9 hours', 'Optional 20 to 30 minute easy walk', 'Foam roll for 10 minutes', 'Legs up the wall for 10 minutes'],
  recovery: ['Aim for 8 hours of sleep', 'Short walk after dinner', 'Light static stretching in the evening'],
  easy: ['8 hours of sleep', 'Drink 500 mL of water over the next hour', 'Light foam rolling of calves and quads'],
  interval: [
    '8 to 9 hours of sleep',
    'Protein snack before bed (cottage cheese, yogurt or milk)',
    'Cool shower or 10 to 12 minutes of cold water on tired legs',
    'Tart cherry juice (about 240 mL) if tolerated',
    'Foam roll for 8 to 10 minutes',
  ],
  threshold: [
    '8 to 9 hours of sleep',
    'Protein snack before bed',
    'Foam roll calves, quads and hips for 8 minutes',
    'Compression socks or boots for 20 to 30 minutes if available',
  ],
  long: [
    '9 hours of sleep and a nap of 20 to 30 minutes if possible',
    'Legs up the wall for 10 minutes',
    'Cool bath or shower for 10 minutes',
    'Protein snack before bed (cottage cheese, yogurt or milk)',
    'Check your weight: replace 1.25 to 1.5 L of fluid for every 1 kg lost',
  ],
  strength: [
    '8 hours of sleep',
    'Protein with every meal today (20 to 30 g)',
    'Skip ice baths after strength sessions as they can blunt adaptation',
    'Light walk later in the day',
  ],
  crossfit: [
    '8 hours of sleep',
    'Protein with every meal today',
    'Easy walk and gentle mobility in the evening',
    'Hydrate well. Add a pinch of salt to your drink if you sweat heavily.',
  ],
  race: [
    '9 hours of sleep (the first night after the race may be restless; nap the next day)',
    'Walk 10 to 15 minutes within the hour to keep the legs moving',
    'Avoid alcohol for 24 hours',
    'Two to three easy days or complete rest before your next run',
  ],
}

const HYDRATION = {
  rest: 'Drink to thirst. Aim for 30 to 35 mL per kg of body weight across the day. Your urine should be pale yellow.',
  recovery: 'Drink to thirst. Sip 150 to 250 mL of water before the run.',
  easy: 'Drink 300 to 500 mL of water in the 2 hours before. During a run under 60 minutes, water is enough.',
  interval: 'Drink 5 to 7 mL/kg in the 4 hours before. Carry or drink water during recoveries. Add sodium on hot days.',
  threshold: 'Drink 5 to 7 mL/kg in the 4 hours before. Plain water is fine for sessions under 60 minutes.',
  long: 'Drink 5 to 7 mL/kg in the 4 hours before. During the run drink 400 to 800 mL per hour with 300 to 600 mg of sodium per litre.',
  strength: 'Sip 500 mL of water during the session. Keep drinking throughout the afternoon.',
  crossfit: 'Sip 500 to 750 mL during the session. Add electrolytes on hot days.',
  race: 'Sip 5 to 7 mL/kg in the 4 hours before. Use aid stations: 150 to 250 mL every 15 to 20 minutes with sodium.',
}

function duringFuel(type, durationMin, level) {
  if (!['easy', 'interval', 'threshold', 'long', 'race', 'recovery'].includes(type)) return null
  if (durationMin < 60) return null
  let carbs
  if (durationMin < 90) carbs = '30 g of carbohydrate per hour (a gel or a few sips of sports drink every 20 minutes)'
  else if (durationMin < 150) carbs = '45 to 60 g of carbohydrate per hour (1 gel every 30 to 40 minutes plus sports drink)'
  else carbs = '60 to 90 g of carbohydrate per hour (train your gut: gel or chew every 20 to 25 minutes)'
  if (level === 'beginner' && durationMin >= 90) carbs = '40 to 60 g of carbohydrate per hour (start with a gel every 40 minutes)'
  return {
    timing: 'During the run',
    foods: [carbs, 'Sports drink containing sodium', 'Practise exactly what you plan to use on race day'],
    note: 'Start fuelling in the first 30 to 45 minutes. Do not wait until you feel empty.',
  }
}

const EVENING = {
  long: 'Tomorrow is a long run: finish a carbohydrate-rich dinner (pasta, rice, potato) 12 to 14 hours before and drink a glass of water before bed.',
  race: 'Tomorrow is race day: eat a familiar, carbohydrate-focused dinner (rice, pasta, potato), keep fibre low and finish eating 3 hours before bed.',
  interval: 'Tomorrow is an interval day: eat rice or pasta with a lean protein at dinner and go to bed on time.',
  threshold: 'Tomorrow is a threshold day: eat rice or pasta with a lean protein at dinner.',
}

export function buildNutrition({ type, durationMin, level, nextType }) {
  const key = PRE[type] ? type : 'easy'
  return {
    dayCarbs: DAY_CARBS[key],
    pre: PRE[key],
    during: duringFuel(type, durationMin, level),
    post: POST[key],
    recovery: RECOVERY_AIDS[key] ?? RECOVERY_AIDS.easy,
    hydration: HYDRATION[key],
    evening: EVENING[nextType] ?? null,
  }
}

const SLEEP_HOURS = {
  rest: [8, 9],
  recovery: [8, 8.5],
  easy: [7.5, 8.5],
  strength: [8, 8.5],
  crossfit: [8, 8.5],
  interval: [8, 9],
  threshold: [8, 9],
  long: [8.5, 9.5],
  race: [8.5, 9.5],
}

export function buildSleep({ type, level, nextType }) {
  const [lo, hi] = SLEEP_HOURS[type] ?? SLEEP_HOURS.easy
  const bonus = level === 'elite' ? 0.5 : 0
  const hardNext = ['long', 'race', 'interval', 'threshold'].includes(nextType)
  return {
    hours: `${lo + bonus} to ${hi + bonus}`,
    note: hardNext
      ? 'Tomorrow is a key session. Protect tonight: lights out on time, no screens 30 minutes before bed.'
      : 'Keep a regular bed and wake time. Room cool (about 18 °C), dark and quiet.',
    tips: [
      'Stop caffeine 8 hours before bedtime',
      'Dim lights and avoid screens for 30 minutes before bed',
      'A 20 to 30 minute nap before 3 pm is a bonus after hard sessions',
    ],
  }
}
