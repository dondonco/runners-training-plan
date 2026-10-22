// Persona notes attached to every daily session.
//   Olympic Coach  -> coach
//   Rehab Doctor   -> rehab (what to watch, when to stop)
//   Sports PT      -> pt   (prehab / strength focus linked to the day)

export const PHASES = {
  base: {
    label: 'Base',
    focus: 'Build the aerobic engine and tissue durability. Keep nearly everything easy.',
  },
  build: {
    label: 'Build',
    focus: 'Introduce more quality work. Hard days hard, easy days easy.',
  },
  peak: {
    label: 'Peak',
    focus: 'Race-specific sessions at the highest volume of the plan. Sleep and fuel carefully.',
  },
  taper: {
    label: 'Taper',
    focus: 'Cut volume, keep a little speed and arrive fresh. Trust the work already done.',
  },
  race: {
    label: 'Race week',
    focus: 'Short, sharp, rested. Logistics, fuelling and sleep matter more than fitness now.',
  },
}

export const TYPE_META = {
  easy: { label: 'Easy run', short: 'Easy', color: '#16a34a' },
  recovery: { label: 'Recovery run', short: 'Recovery', color: '#0d9488' },
  interval: { label: 'Interval run', short: 'Intervals', color: '#dc2626' },
  threshold: { label: 'Threshold run', short: 'Threshold', color: '#ea580c' },
  long: { label: 'Long slow distance (LSD)', short: 'LSD', color: '#2563eb' },
  strength: { label: 'Strength training', short: 'Strength', color: '#7c3aed' },
  crossfit: { label: 'Cross-fit training', short: 'Cross-fit', color: '#c026d3' },
  rest: { label: 'Rest day', short: 'Rest', color: '#64748b' },
  race: { label: 'Race day', short: 'Race', color: '#ca8a04' },
}

export const RUN_TYPES = ['easy', 'recovery', 'interval', 'threshold', 'long', 'race']

const COACH = {
  easy: 'Easy means conversational. If you cannot speak a full sentence, slow down. The aerobic base you build today pays for every fast session later.',
  recovery: 'Slower than you think. This run is for blood flow, not fitness. If your legs feel heavy, cut it short or walk. Nobody ever won a race on a recovery run.',
  interval: 'Run rep 1 and the last rep at the same pace. If the final reps slip more than 5 s/km, end the session. Quality over quantity. Jog the recoveries truly easy.',
  threshold: 'Comfortably hard: a few words at a time but no conversation. Start controlled and finish the final minutes strong. Even effort beats heroics.',
  long: 'Start slow, finish steady. Practise race-day shoes, kit and fuelling. The long run teaches your body to burn fat, store fuel and hold form when tired.',
  strength: 'Strong runners are durable runners. Lift with perfect form and leave one or two reps in reserve. Strength is for the last 5 km of your race, not for a personal record at the gym.',
  crossfit: 'Cross-training builds the engine without pounding your legs. Keep it moderate (RPE 6 to 7), keep movements clean and stop before technique breaks down.',
  rest: 'Adaptation happens while you rest, not while you train. A planned rest day is part of the programme, not a day off from it.',
  race: 'Trust your training. Go out 5 to 10 seconds per km slower than goal pace for the first kilometre, settle in, and run the second half faster.',
}

const REHAB = {
  easy: 'Green: mild muscle tightness that eases as you warm up. Amber: pain that stays at 3 to 4 out of 10 — shorten the run. Red: sharp pain, limping or pain that worsens as you run — stop and see the Injury Clinic page.',
  recovery: 'This is the safest session of the week and a good "test run" of any niggle. If the niggle gets worse by minute 10, walk home and rest.',
  interval: 'Fast running loads hamstrings, calves and Achilles most. Do not skip the drills and strides. A sudden sharp pain at the back of the thigh or calf means stop immediately.',
  threshold: 'Watch the outer hip and knee (IT band) and the shins when pace is sustained. Ease off if you feel pain on the outside of the knee at a repeatable time into the run.',
  long: 'Long runs expose overuse issues: outer hip, IT band, feet and shins. Run on varied surfaces, change shoes every 600 to 800 km and take pain that grows over the hours seriously.',
  strength: 'Muscle burn and fatigue are normal; joint pain is not. Keep to a pain-free range of motion. Stop if a tendon (Achilles, patellar, hamstring origin) hurts more than 3 out of 10.',
  crossfit: 'Avoid jumping and heavy loaded impact if you have shin, foot or hip pain. Substitute the air bike or rowing machine.',
  rest: 'Rest is when tendons and bones adapt. Gentle mobility is fine; massaging through sharp pain is not. If a niggle lasts over 7 days, book a clinical assessment.',
  race: 'Do not race through sharp pain. Mild tightness warms up; real injury does not. Take the first 2 days after the race easy and look for any lasting pain.',
}

const PT = {
  easy: 'After your run, finish 10 glute bridges and 30 seconds of side plank each side. It takes 3 minutes and protects your hips.',
  recovery: 'Use this run to check form: tall posture, relaxed shoulders, quiet feet, quick cadence. Do 10 single-leg balances on each leg afterwards.',
  interval: 'Prehab: do your glute activation before the drills (10 clamshells or 10 banded walks each side). Strong glutes control the pelvis at speed.',
  threshold: 'Run tall and keep your hips level. Think "quiet feet". A few banded side steps beforehand help to switch on the hip stabilisers.',
  long: 'Check form every 20 minutes: tall chest, relaxed hands, short quick steps. Post-run, spend 5 minutes on calves, hip flexors and glutes.',
  strength: 'Technique first, load second. Move through the full pain-free range, control the lowering phase and keep the pelvis level on single-leg work.',
  crossfit: 'Pick low-impact stations on days when your calves or shins feel tight. Keep your core braced and the hips level on carries and lunges.',
  rest: 'Do the mobility flow and 3 minutes of breathing. If you have a niggle, add the rehab plan from the Injury Clinic.',
  race: 'Warm up thoroughly: dynamic stretching, drills and 4 strides. Cool down with 5 to 10 minutes of walking and gentle stretching.',
}

export function guidanceFor(type, phase) {
  return {
    coach: `${COACH[type]} Phase focus: ${PHASES[phase].focus}`,
    rehab: REHAB[type],
    pt: PT[type],
  }
}
