// On-device social-story generator. Builds a structured, first/third-person
// social story from the parent's settings — no backend required. (A server-side
// AI generator + illustrations can replace this later; the data shape matches.)

export interface StorySettings {
  childName: string;
  title: string;
  goal: string;        // what the story is about, e.g. "going to the dentist"
  perspective: "first" | "third";
  length: "short" | "medium" | "long";
  tone: string;        // e.g. "calm", "encouraging"
}

export interface GeneratedPage {
  heading: string;
  text: string;
}

const LENGTH_PAGES = { short: 4, medium: 7, long: 10 } as const;

export function generateStory(s: StorySettings): GeneratedPage[] {
  const name = s.childName || "I";
  const first = s.perspective === "first";
  const I = first ? "I" : name;
  const me = first ? "me" : name;
  const my = first ? "my" : `${name}'s`;
  const am = first ? "am" : "is";
  const feel = first ? "feel" : "feels";
  const can = first ? "can" : "can";
  const goal = s.goal.trim() || "something new";

  // Core social-story beats. We pick a subset based on length.
  const beats: GeneratedPage[] = [
    {
      heading: "About this story",
      text: `This is a story about ${first ? "me" : name}. It helps ${me} get ready for ${goal}.`,
    },
    {
      heading: "What will happen",
      text: `Sometimes ${I} ${can} do ${goal}. It is okay to take ${my} time and go slowly.`,
    },
    {
      heading: `How ${I} might feel`,
      text: `${I} might ${feel} unsure or wobbly about ${goal}. Lots of people ${feel} that way at first. That is okay.`,
    },
    {
      heading: "My body signals",
      text: `When ${I} ${feel} big feelings, ${my} body might feel fast or tight. Noticing this helps ${me} know what ${I} need.`,
    },
    {
      heading: "What can help",
      text: `${I} ${can} take slow breaths. ${I} ${can} ask a grown-up for help. ${I} ${can} hold something that feels nice.`,
    },
    {
      heading: "Taking a break",
      text: `If it feels like too much, ${I} ${can} ask for a break. Breaks help ${my} body feel calm again.`,
    },
    {
      heading: "People who help me",
      text: `Grown-ups who love ${me} are there to help. ${I} ${am} not on ${my} own.`,
    },
    {
      heading: "One step at a time",
      text: `${I} do not have to do everything at once. One small step at a time is good enough.`,
    },
    {
      heading: "Being proud",
      text: `Trying is brave. ${I} ${can} feel proud of ${me} for having a go at ${goal}.`,
    },
    {
      heading: "The end",
      text: `${I} ${am} learning and growing every day. ${I} ${can} do hard things, a little at a time.`,
    },
  ];

  const count = LENGTH_PAGES[s.length];
  // Always keep the first ("about") and last ("the end") beat.
  if (count >= beats.length) return beats;
  const middle = beats.slice(1, beats.length - 1);
  const keepMiddle = count - 2;
  const stepped: GeneratedPage[] = [];
  for (let i = 0; i < keepMiddle; i++) {
    stepped.push(middle[Math.floor((i * middle.length) / keepMiddle)]);
  }
  return [beats[0], ...stepped, beats[beats.length - 1]];
}
