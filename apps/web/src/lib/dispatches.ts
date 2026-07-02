export type Dispatch = {
  slug: string;
  school: string;
  thinker: string;
  tag: string;
  title: string;
  titleEm: string;
  dek: string;
  quote: string;
  read: string;
  body: string[];
  cta: string;
};

const WORDS_PER_MINUTE = 200;

function computeReadTime(body: string[]): string {
  const words = body.join(" ").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min`;
}

// Read time is derived from actual body length, not hand-typed — an article
// cannot claim a length it doesn't deliver, and future entries inherit the
// same guarantee automatically.
type DispatchDraft = Omit<Dispatch, "read">;

const DRAFTS: DispatchDraft[] = [
  {
    slug: "the-dichotomy-of-control",
    school: "Stoicism · Epictetus",
    thinker: "after Epictetus",
    tag: "The Dichotomy of Control",
    title: "You are keeping the wrong",
    titleEm: "scoreboard.",
    dek: "The single division the Stoics built a discipline on — and the only game an athlete can actually win.",
    quote:
      "Master the input. Release the outcome. That is not weakness — it is the only game you can win.",
    body: [
      "The result is not yours to own. The time on the clock, the place on the podium, whether the room clapped, whether the judge saw what you saw — none of it sits inside your hands. Epictetus, born a slave in Hierapolis and lame for most of his life from a master who broke his leg rather than freed it, built an entire philosophy on one division: some things are up to us, and most things are not. Confuse the two and you suffer by design. Separate them cleanly and, for the first time, you become difficult to defeat, because there is very little left for anyone to take from you.",
      "For the athlete the line is unusually sharp, sharper than in almost any other pursuit, because competition manufactures the illusion that everything is at stake and everything is controllable if only you want it badly enough. You do not control the conditions, the draw, the officiating, the weather, or the sixteen years of preparation that preceded your opponent's arrival on the same field as you. You control the rep you did not skip. The breath you governed under load. The extra ten minutes of mobility work no one is grading. That is the whole of your jurisdiction. It sounds like less than everything. It is, in fact, everything that ever mattered.",
      "This is not resignation dressed up in Greek. The Stoic trains harder than almost anyone, precisely because effort is the one province fully under his command, and a man who has stopped bargaining with fate has nothing left to do with his energy except spend it completely on the thing he can move. What he refuses is to stake his peace, his identity, his sense of whether the season was worth it, on a verdict handed down by forces entirely outside himself. He pours everything into the input. Then, having done so, he lets the outcome be whatever it is going to be, because outrage at an outcome you never controlled is simply wasted suffering.",
      "Most athletes invert this without noticing. They obsess over the result they cannot touch and grow careless with the inputs they can — anxious about the scoreboard, casual about the warm-up; furious at a call, indifferent to the extra set. Watch closely and you will see it everywhere: the pre-competition ritual that has nothing to do with preparation and everything to do with superstition, an attempt to reach backward and control what has already left your hands. Epictetus would call this exactly what it is. A category error, repeated daily, that manufactures suffering from thin air.",
      "Consider what actually happens in the moments before a max attempt, a start gun, a whistle. The untrained mind runs immediately to the outcome — will this work, will I fail, what will they think. None of that is available for you to decide in that instant. What is available is the bar path, the breath, the brace, the exact sequence rehearsed ten thousand times in the empty hours no one attended. The athlete who has done the Stoic work has already relocated their attention there, weeks before the moment arrived, so that when it does arrive there is nothing left to negotiate.",
      "Notice, too, how this plays out over a season rather than a single moment. The athlete who has internalized the division stops needing a good week to feel good about their training, because the training was never being evaluated by the week's results in the first place. The athlete who has not internalized it rides every review, every comparison, every outside opinion like a small boat in open water — steady when the feedback is kind, capsized the moment it isn't. Only one of these two is actually free to keep training through a difficult stretch.",
      "The dispatch from antiquity, then, is a reversal of instinct: be ruthless about what is yours and nearly indifferent to what is not. Not because the outcome doesn't matter — it matters enormously, which is exactly why it cannot be allowed to govern you — but because indifference to what you cannot move is the only stable ground from which to give everything to what you can. Epictetus did not write for emperors. He wrote for a soldier's mess and a marketplace, for people who had far less control over their circumstances than any modern athlete complaining about the officiating. If the division held for a man who could be sold, it holds for you.",
      "Build the discipline of the division before you need it in competition, and competition stops being the site where your composure is tested. It becomes the site where it is simply demonstrated.",
    ],
    cta: "A program built around inputs you control — your schedule, your state, your constraints.",
  },
  {
    slug: "the-obstacle-is-the-way",
    school: "Stoicism · Marcus Aurelius",
    thinker: "after Marcus Aurelius",
    tag: "The Obstacle Is the Way",
    title: "The thing blocking you",
    titleEm: "is the path.",
    dek: "Marcus Aurelius did not tolerate adversity. He understood it as the work itself.",
    quote:
      "The obstacle does not stand in the way of the work. The obstacle is the work.",
    body: [
      "An emperor at the head of a collapsing frontier, fighting wars he never wanted against tribes he could not fully subdue, managing a plague that emptied his own household, Marcus Aurelius wrote a private note to himself in a tent by candlelight that has outlived his empire by two thousand years: the impediment to action advances action. What stands in the way becomes the way. He was not describing a coping mechanism. He was describing the actual mechanics of how strength gets built, in a body or in an empire.",
      "He did not merely endure obstacles, the way a stone endures weather, passively and without transformation. He recognized them as the material from which everything worth having is made — the only material available, in fact, since a life without resistance produces nothing but softness. There is no forge that produces temper without heat, and there is no athlete who produces resilience without the specific obstacle that forced the adaptation.",
      "The athlete meets this constantly and usually misreads it in the moment it matters most. The injury that forces a rebuild of mechanics you had never questioned. The plateau that demands you abandon an approach you were personally attached to, sometimes for years. The loss that strips away a confidence that, in retrospect, was never earned in the first place — only borrowed from a string of wins against opposition that had not yet found your weakness. Each of these feels, from inside the moment, like an interruption to the training. Each of them, examined honestly afterward, turns out to have been the training.",
      "There is no version of progress that routes around difficulty. Difficulty is the medium progress moves through, the way water is the medium a current moves through — remove it and there is no current, only a dry channel where one used to be. The wall you meet in week six of a new program is not evidence that you took a wrong turn, chose the wrong coach, or were given a flawed plan. It is the precise coordinate where adaptation becomes available, on the single condition that you are willing to treat it as a problem to be worked rather than a fate to be lamented.",
      "This is where most training stalls, not from lack of effort but from a failure of interpretation. The athlete arrives at the obstacle, correctly identifies that something is now harder than it was, and draws the wrong conclusion — that harder means broken, that resistance means the plan has failed. Marcus drew the opposite conclusion from every obstacle Rome put in front of him: that resistance meant the empire, or the man, had finally arrived at the place where real work could begin.",
      "Marcus never got the luxury of choosing his obstacles, and neither does the athlete. He did not select the plague any more than a shoulder selects its own impingement, or a season selects the exact week an Achilles decides to finally protest years of accumulated volume. What he controlled, in both cases, was the response — whether the obstacle would be treated as a verdict on his worth or as raw material awaiting the specific kind of transformation it demanded. The emperor chose the second reading daily, in a tent, with no one grading his journal. That choice is available to you in a treatment room just as readily as it was available to him on a frontier.",
      "This is why the methodology treats a flagged restriction not as a subtraction from the plan but as a specification for it — the same instinct Marcus applied to a frontier he did not choose. The constraint becomes an input, not an apology.",
      "The athletes who last, across the decades rather than a single competitive window, are not the ones who found a path clear of obstacles. No such path exists, and searching for one is itself a slow way of quitting. The ones who last are the ones who stopped asking how to get around the wall and started asking, at the wall itself, a different question entirely — not \"how do I avoid this,\" but \"what is this here to build in me.\"",
      "That reframe alone will not remove the obstacle. It will change what the obstacle is permitted to do to you while it stands in your way.",
    ],
    cta: "Restrictions are not exclusions from the work. The methodology routes them into it.",
  },
  {
    slug: "amor-fati",
    school: "Existentialism · Nietzsche",
    thinker: "after Friedrich Nietzsche",
    tag: "Amor Fati",
    title: "What if the grind",
    titleEm: "was the point?",
    dek: "Nietzsche asked for more than endurance. He asked you to love the fate that forges you.",
    quote:
      "Not to tolerate it. Not to endure it. To love it. The athlete who loves the grind never runs out of reason to show up.",
    body: [
      "Everyone wants the result — the time, the title, the transformation photograph. Nietzsche proposed something considerably more demanding and, it turns out, considerably more durable: amor fati, love of fate. Not a grim, teeth-gritted acceptance of what befalls you, the posture of a man enduring a sentence. An active, deliberate embrace of all of it, especially — this is the hinge of the whole idea — especially the hard parts, the parts a lesser philosophy would tell you merely to tolerate.",
      "For the athlete this translates with unusual precision. It means the five a.m. sessions no one will ever see and no one will ever applaud. The plateaus that test patience until patience frays and then keep testing it further. The setbacks that walk in uninvited, on a Tuesday, with no warning, and expose exactly what your character was made of underneath the results that had been flattering you. The instruction from Nietzsche is not to grit your teeth through these and wait for them to pass. It is to want them — to recognize them as inseparable from the life you have already claimed you are choosing to live.",
      "This is the load-bearing difference between motivation and something considerably sturdier. Motivation is a feeling, and feelings arrive and depart on a schedule that has nothing to do with your training calendar. The athlete who waits for motivation to show up before doing the work has quietly outsourced their performance to a mood they do not control — which is precisely the abdication amor fati is built to dismantle.",
      "The athlete who has actually learned to love the work itself has removed the feeling from the equation as a precondition entirely. There is always a reason to show up on a cold morning when the reason is not \"I feel like it\" but \"this is the thing I have chosen to love,\" because love, unlike motivation, does not require a mood to sustain it. It only requires memory of the choice.",
      "None of this is comfortable to hear, and Nietzsche did not intend it to be. Amor fati is not a productivity technique dressed in German. It is a total reorientation of what you are permitted to resent. You do not get to keep only the triumphant parts of a pursuit and disown the rest as unfortunate circumstance. You take the whole of it, the plateau alongside the personal best, the setback alongside the breakthrough, or you take none of it — because a love that only shows up for the good days was never love of the fate, only love of the outcome, and outcomes are not yours to control.",
      "Amor fati is the decision to take the whole of it anyway. And the athlete who makes that decision honestly, not as a slogan but as a daily practice, discovers something that looks at first like a trick of language but is not: the grind was never the price paid for the prize. Examined closely enough, for long enough, the grind turns out to have been the prize the entire time, and the personal best at the end of it is simply the receipt.",
    ],
    cta: "Build a practice you can return to on the days the feeling does not come.",
  },
  {
    slug: "wu-wei",
    school: "Eastern Philosophy · Taoism",
    thinker: "after Laozi",
    tag: "Wu Wei",
    title: "You are trying so hard",
    titleEm: "it's working against you.",
    dek: "The Taoist principle of effortless action — and why you cannot grip your way to a personal best.",
    quote: "Trust the training. Release the result. That is wu wei.",
    body: [
      "There is a Taoist principle called wu wei, usually rendered into English as \"effortless action,\" a translation that makes it sound passive, decorative, almost lazy. It is none of those things. Wu wei describes what happens when training has been driven so deep into the body that execution stops being a decision made in real time. The action arrives on its own, without the interference of a conscious mind straining to direct traffic it no longer needs to direct.",
      "You have seen this, even if you did not have a name for it. The athlete who looks, from the stands, as though they are barely trying. They did not arrive at the event by trying less. They arrived at it having gone considerably deeper than the athlete straining visibly beside them. The mechanics have been drilled below the threshold of conscious control, into a layer where thought would only slow the system down, and what remains on competition day looks like ease because, in a very real sense, it now is ease — the effort was spent earlier, across hundreds of repetitions in an empty gym on days that did not count toward anything anyone was watching.",
      "Forcing creates tension. Tension creates error. Error destroys the very performance the forcing was meant to protect. This is not a metaphor; it is closer to a law of motor control. The harder you grip a barbell in the exact moment that matters, the more certainly you tighten the very system you are asking to move freely and fast beneath you. You cannot will your way to a personal best by clenching harder at the top of the lift than you did in the warm-up sets. The clench is not extra effort. The clench is the obstacle, manufactured by your own nervous system, at the worst possible time.",
      "This is why the practice — any practice, a lift, a swing, a stride pattern — is deliberately built to be repeated until it disappears from conscious awareness. The visible work of training is not actually the point of training. The point is to make trust possible: to earn, through several thousand unglamorous repetitions performed with no audience and no stakes, the right to let go on the day that does have stakes and allow the result to arrive without your interference.",
      "Laozi did not write for athletes, but the water imagery he returned to again and again describes the state precisely. Water does not force its way around a stone. It finds the shape of what is in front of it without strain, because it has no interest in imposing its will on the terrain — only in moving through it as completely as its nature allows. The trained body, at the moment of expression, needs to behave the same way: shaped by ten thousand hours of prior work, moving through the moment rather than fighting it.",
      "None of this means the work itself is effortless — the opposite is true, and no serious reading of the idea claims otherwise. The years leading up to a moment of wu wei are the hardest, most deliberate years an athlete will spend. What becomes effortless is only the final expression, and only because everything difficult about it was already paid for, in full, long before the moment arrived that made it look easy.",
      "Trust the training. Release the result. That is not resignation. That is what ten thousand honest repetitions have purchased you the right to do.",
    ],
    cta: "Drilled patterns, calibrated to your state, until execution stops being a decision.",
  },
  {
    slug: "arete",
    school: "Greek Virtue Ethics · Aristotle",
    thinker: "after the Hellenic tradition",
    tag: "Arete",
    title: "Excellence is not a trophy.",
    titleEm: "",
    dek: "The Greeks had a word for excellence — and it described a way of moving through the world, not a result.",
    quote:
      "Your pursuit is not a season. It is a standard. And standards do not come off when the competition ends.",
    body: [
      "The ancient Greeks had a word: arete. It is usually translated as \"excellence,\" and that translation misses almost everything that made the word worth having in the first place. Arete was not a result. It was not a medal, a personal record, or a number on a leaderboard that could be captured and forgotten. It was a way of being — the full, consistent expression of your highest capability, in every moment of an ordinary week, not only in the handful of moments that happen to be scored in public.",
      "The Greek who embodied arete was not excellent only in the arena, the way a modern athlete might be excellent only when a camera or a coach was present to certify it. He was excellent in how he trained on the days no competition was scheduled. Excellent in how he recovered, how he ate, how he conducted himself in the gymnasium when there was no audience and, critically, no consequence for cutting a corner that nobody would ever discover had been cut. Excellence was not something he produced on demand for an occasion. It was something he simply was, continuously, whether or not anyone was there to witness it.",
      "For the modern athlete this is a quietly radical demand, because it moves the entire standard off the competition calendar and relocates it into the ordinary Tuesday. The quality of your warm-up when no one is timing it. The honesty of your last set when a slightly shorter range of motion would be invisible to everyone in the room except you. The decision to do the unglamorous accessory work correctly, at a lighter weight than your ego wants, when cutting the corner would cost you nothing visible for months. These are not preparation for the test. Properly understood, they are the test, and the test is administered daily.",
      "This is a harder standard to meet than winning, not an easier one, because winning is intermittent and arete is not permitted to be. A single competitive result can be won on a good day, with favorable circumstances, against an opponent having a worse one. Arete admits no such shortcuts. It asks the same question every single day and grades every single answer, which is exactly why the Greeks considered it the higher achievement — not because it is more impressive to watch, but because it is far harder to fake.",
      "This is also why arete resists shortcuts that winning does not. A result can be borrowed — a favorable draw, an opponent's off day, a piece of equipment that happened to be dialed in. Arete cannot be borrowed from anyone, on any day, under any circumstance, because it is not a single performance being judged. It is the entire pattern of performances, public and private, being judged against itself. There is no single afternoon dishonest enough to fake a pattern that has been built, or not built, across years.",
      "Consider the athlete who trains alone for years before any result validates the choice. If arete were only about the eventual result, those years would be wasted time, a gamble that happened to pay off later. Understood correctly, they were never a gamble. They were the thing itself, already complete, regardless of what a result would later confirm or fail to confirm.",
      "Your athletic pursuit, understood through this lens, is not a season that opens in spring and closes in autumn, after which you are permitted to set the standard down until it is convenient to pick back up. It is a standard you carry, full stop, the way you carry your own name. And a standard, unlike a result, does not come off when the competition ends. Either it is who you are in the unwatched hours, or it was only ever a costume you put on for the occasion and hung back up the moment the occasion passed.",
      "Arete is the refusal to wear the costume. It is the decision that the version of you training alone on a Wednesday in February, with nothing on the calendar and no one watching, is the same version of you that shows up when everything is on the line — because if those two versions are different people, the one on the line was always going to be found out eventually.",
    ],
    cta: "A standard held every session — built into the structure, not left to motivation.",
  },
  {
    slug: "memento-mori",
    school: "Stoicism · Seneca",
    thinker: "after Seneca",
    tag: "Memento Mori",
    title: "Your prime has an",
    titleEm: "expiration date.",
    dek: "The Stoics contemplated death daily — not morbidly, but as the sharpest instrument of focus they had.",
    quote:
      "Anxiety is panic. Urgency is clarity. One makes you spiral. The other makes you move.",
    body: [
      "The Stoics kept a daily practice that sounds morbid until you understand precisely what it was built to do: memento mori, the deliberate contemplation of one's own death, performed not once in a crisis but as a routine, the way you might review a training log. The purpose was never to dwell in dread. It was to sharpen attention to a fine point. A thing you might lose at any moment, without warning and without appeal, is a thing you immediately stop wasting — and mortality, held steadily in view rather than pushed to the margins, turns out to be the most honest accountant available for how you actually spend a day.",
      "Seneca, who wrote extensively on the shortness of life while serving an emperor capable of ending his own on a whim, understood something the modern athlete tends to discover only in retrospect, usually too late to act on it: most people do not run out of time. They spend it, carelessly, on things that felt urgent and were not, while the things that were actually finite quietly ran out underneath them, unnoticed until the account was already empty.",
      "The athlete carries a smaller, sharper version of this same clock, and carries it whether or not they choose to look at it. A finite number of competitive seasons. A finite number of mornings on which the body will answer a hard training demand the way it should, without the small negotiations and compromises that arrive, uninvited, with age. A finite number of repetitions available at genuine full capacity, before diminishing returns and accumulated wear start setting the terms instead of ambition. None of this is renewable on request, and the overwhelming majority of it is spent before the athlete realizes it was being spent at all.",
      "Most athletes pass their best physical years in a comfortable fog, distracted by things that will not matter in five years, inconsistent in ways they assume they will correct \"once things settle down,\" certain in some unexamined way that there will be time later to get properly serious. Then, without any single dramatic moment marking the change, they look up and the window has quietly closed. What follows is rarely regret about the sessions that were hard. It is regret, considerably sharper, about the sessions that were never attempted at all — the ones deferred so long they simply expired, unclaimed.",
      "There is a specific, unglamorous version of this that shows up in a training log rather than a eulogy: the missed session rationalized as \"I'll make it up next week,\" repeated often enough that next week absorbs an entire year. Seneca's argument is not that you should panic about this. It is that you should notice it, clearly and without flinching, the way you would notice a leak in a roof — not to despair over the water damage already done, but because noticing is the only mechanism available for stopping the next drop.",
      "Memento mori, applied to training, is not a call to train recklessly against your body's actual limits, chasing volume the joints cannot yet support. It is a call to stop pretending the window is indefinite when it demonstrably is not. The two instructions look similar from a distance and are opposites up close — one destroys the vessel to beat a clock that was never actually racing you; the other simply refuses to let a finite resource be spent on autopilot.",
      "The Stoic correction is urgency, and urgency has to be carefully distinguished from its imposter, anxiety, because the two produce opposite results despite feeling adjacent. Anxiety is panic about an outcome that sits outside your control, and panic, true to form, makes you spiral — it consumes energy without directing any of it usefully. Urgency is clarity about a window that is measurably, finitely closing, and clarity, unlike panic, makes you move. It converts the same fact — that time is limited — into fuel instead of dread.",
      "Train, then, as though this window were closing — not as a morbid exercise, but as an accurate one, because it is closing, on a schedule no one gets to negotiate. Held daily rather than avoided, that single fact tends to burn the comfortable fog off on its own, without requiring any additional motivation beyond the plain truth of it.",
    ],
    cta: "Stop deferring. A program built around where you actually are, starting now.",
  },
  {
    slug: "eudaimonia",
    school: "Greek Virtue Ethics · Aristotle",
    thinker: "after Aristotle",
    tag: "Eudaimonia",
    title: "The goal was never",
    titleEm: "the trophy.",
    dek: "Aristotle's idea of flourishing is built across thousands of decisions no one sees. Build the person; the results follow.",
    quote:
      "The goal was never the trophy. The goal was to become someone who deserved it.",
    body: [
      "Aristotle gave us eudaimonia, a word usually translated as \"happiness,\" though \"flourishing\" sits considerably closer to what he actually meant by it. Eudaimonia is not a feeling that arrives and departs with your mood, and it is not a single triumphant moment you can point to on a calendar. It is the condition of a life lived fully in accordance with its highest capacities, realized gradually, across time, through the accumulation of decisions rather than delivered in a single instant of victory. Crucially, and this is the part modern athletic culture tends to skip, it is not achieved the instant you win. It is built across thousands of decisions no spectator will ever see or score.",
      "This reframes the entire project of training, once you actually sit with it. Chasing a result while neglecting the person who has to produce that result is a trap that closes slowly enough to go unnoticed while it is closing. You can, with sufficient discipline aimed entirely at the outcome, optimize your way to the exact result you were chasing and arrive at it somehow hollow — having become someone who obtained the trophy without ever becoming someone equipped to carry what the trophy was supposed to represent. In cases like this the win does not deliver the satisfaction it promised. It exposes the gap that was there all along, rather than filling it the way it was supposed to.",
      "The alternative Aristotle describes is not more complicated, only slower and less immediately gratifying: build the person first. Make the decisions — in training, in recovery, in how you conduct yourself when a shortcut is available and undetectable — that compound over months and years into a particular kind of character. Let the results arrive as a byproduct of who you have gradually become, rather than treating a result as a substitute for the becoming, a shortcut around the actual work of building someone capable of sustaining it.",
      "The athlete constructed this way, decision by unglamorous decision, does not collapse when a particular result fails to arrive on schedule — an injury, a bad judging day, an opponent having the performance of their life — because the result was never actually the point, however much it may have felt like the point in the moment before the whistle. The point was always the person being built underneath the pursuit of the result, and that person does not evaporate when a single outcome goes the wrong way.",
      "This is, in the end, a considerably higher bar than simply winning, not a lower one, because winning can be outsourced to circumstance in a way that flourishing cannot. You can win on a day when your preparation was mediocre but your opposition was worse. You cannot flourish, in Aristotle's sense, by accident — eudaimonia requires the actual decisions, repeated with actual consistency, whether or not the scoreboard happens to cooperate on any given afternoon.",
      "The goal, understood this way, was never the trophy. The goal was to become someone who deserved it — and that person, once genuinely built through the accumulation Aristotle describes, does not need the trophy's arrival to confirm what was already true. Ask of today, then, not what it wins you by evening. Ask what it builds in you that a single evening cannot undo.",
    ],
    cta: "Build the athlete you are becoming — one structured decision at a time.",
  },
];

export const DISPATCHES: Dispatch[] = DRAFTS.map((d) => ({
  ...d,
  read: computeReadTime(d.body),
}));
