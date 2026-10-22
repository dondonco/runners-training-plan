// Stretching, warm-up and cool-down routines that wrap every session.
// Items reference ids in exercises.js; `rx` is the prescription text.

const it = (exerciseId, rx) => ({ exerciseId, rx })

const dynamicEasy = [
  it('leg-swings-fb', '10 each leg'),
  it('leg-swings-lat', '10 each leg'),
  it('ankle-rocks', '10 each ankle'),
  it('hip-circles', '8 each direction, each leg'),
]

const dynamicQuality = [
  ...dynamicEasy,
  it('worlds-greatest', '4 each side'),
  it('walking-lunge-rot', '6 each leg'),
]

const dynamicLong = [...dynamicEasy, it('cat-cow', '8 slow cycles'), it('worlds-greatest', '3 each side')]

const dynamicGym = [
  it('cat-cow', '8 slow cycles'),
  it('worlds-greatest', '4 each side'),
  it('hip-circles', '8 each direction, each leg'),
  it('ankle-rocks', '10 each ankle'),
]

// Step 1 of every training day: dynamic stretching / mobility
export const PRE_MOBILITY = {
  easy: { minutes: 4, items: dynamicEasy },
  recovery: { minutes: 4, items: dynamicEasy },
  interval: { minutes: 7, items: dynamicQuality },
  threshold: { minutes: 7, items: dynamicQuality },
  race: { minutes: 7, items: dynamicQuality },
  long: { minutes: 6, items: dynamicLong },
  strength: { minutes: 6, items: dynamicGym },
  crossfit: { minutes: 6, items: dynamicGym },
}

export const RUN_DRILLS = [
  it('a-march', '2 x 20 m'),
  it('a-skip', '2 x 20 m'),
  it('high-knees', '2 x 20 m'),
  it('butt-kicks', '2 x 20 m'),
  it('carioca', '1 x 20 m each direction'),
]

// Final step: static stretching, done when the muscles are warm
const staticBasic = [
  it('calf-stretch', '30 s each leg (straight + bent knee)'),
  it('hamstring-stretch', '30 s each leg'),
  it('quad-stretch', '30 s each leg'),
  it('hip-flexor-stretch', '30 s each side'),
]

const staticFull = [
  ...staticBasic,
  it('figure4', '30 s each side'),
  it('tfl-stretch', '30 s each side'),
  it('adductor-stretch', '40 s'),
  it('childs-pose', '45 s with slow breathing'),
]

export const POST_STRETCH = {
  easy: { minutes: 6, items: staticBasic },
  recovery: { minutes: 6, items: staticBasic },
  interval: { minutes: 9, items: staticFull },
  threshold: { minutes: 9, items: staticFull },
  long: { minutes: 10, items: staticFull },
  race: { minutes: 10, items: staticFull },
  strength: {
    minutes: 6,
    items: [
      it('hip-flexor-stretch', '30 s each side'),
      it('hamstring-stretch', '30 s each leg'),
      it('figure4', '30 s each side'),
      it('childs-pose', '45 s'),
    ],
  },
  crossfit: {
    minutes: 6,
    items: [
      it('quad-stretch', '30 s each leg'),
      it('hip-flexor-stretch', '30 s each side'),
      it('figure4', '30 s each side'),
      it('childs-pose', '45 s'),
    ],
  },
}

export const REST_DAY_ITEMS = {
  breathing: [it('breathing', '3 to 5 minutes, before breakfast or at bedtime')],
  mobility: [
    it('cat-cow', '10 slow cycles'),
    it('worlds-greatest', '5 each side'),
    it('hip-flexor-stretch', '45 s each side'),
    it('figure4', '45 s each side'),
    it('childs-pose', '60 s'),
  ],
  foam: [it('foam-roll', '60 to 90 s each: quads, calves, glutes, outer thigh (gently)')],
  recover: [it('legs-up-wall', '5 to 10 minutes'), it('easy-walk', '20 to 30 minutes (optional)')],
}

export const COOLDOWN_STRENGTH_TEXT =
  'Walk or spin easily for 5 minutes until your breathing and heart rate settle.'
