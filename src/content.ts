export interface Photo {
  src: string;
  caption?: string;
}

export interface GateContent {
  title: string;
  button: string;
}

export interface CakeContent {
  name: string;
  candles: number;
  wishLine: string;
  afterCut: string;
}

export interface BouquetNote {
  label: string;
  message: string;
}

export interface BouquetContent {
  title: string;
  finale: string;
  giftLine: string;
  notes: BouquetNote[];
}

export interface SiteContent {
  name: string;
  age: number | null;
  dateLabel: string;
  gate: GateContent;
  songSrc?: string;
  cake: CakeContent;
  photos: Photo[];
  reasons: string[];
  letter: string;
  signature: string;
  finalNote: string;
  bouquet: BouquetContent;
}

export const content: SiteContent = {
  name: "Margaret",
  age: null,
  dateLabel: "25.10.2026",

  gate: {
    title: "A little something for Margaret",
    button: "Open",
  },

  songSrc: "/audio/song.mp3",

  cake: {
    name: "Margaret",
    candles: 5,
    wishLine: "Make a wish, Margaret.",
    afterCut: "The first slice is yours.",
  },

  photos: [
    { src: "/photos/photo-1.jpg", caption: "Us by the river ✨" },
    { src: "/photos/photo-2.jpg", caption: "The most radiant smile" },
    { src: "/photos/photo-3.jpg", caption: "Chasing adventures with you" },
    { src: "/photos/photo-4.jpg", caption: "Quiet moments by rushing waters" },
    { src: "/photos/photo-5.jpg", caption: "The sweetest slice for you" },
    { src: "/photos/photo-6.jpg", caption: "Celebration & shared laughs" },
  ],

  reasons: [
    "You make ordinary days feel lighter.",
    "Your laugh is the best sound in any room.",
    "You are kind without making a show of it.",
    "People are glad when you walk in.",
    "You notice small things and remember them.",
    "Talking to you is the best part of a long day.",
    "You are exactly yourself, and that is rare.",
  ],

  letter:
    "Margaret,\n\nHappy birthday. I wanted to give you something that took more effort than a text, so I built you this.\n\nI hope today is full of people who love you, good food, and no stress at all. You deserve a day that is entirely about you.\n\nThank you for being someone I enjoy talking to. I hope this year is kind to you and brings you everything you have been working toward.\n\nEnjoy your day.",

  signature: "With love, Reuben",

  finalNote: "Handcrafted with love by Reuben for Margaret",

  bouquet: {
    title: "Your birthday bouquet",
    finale: "Priceless.",
    giftLine: "Good for all of the above and so much more — with all my love, Reuben.",
    notes: [
      { label: "One long call", message: "Good for one long phone call, any time you want." },
      { label: "One coffee", message: "Good for one coffee, my treat." },
      { label: "One bad joke", message: "Good for one very bad joke, delivered live." },
      { label: "Your choice", message: "Good for one day where you choose everything." },
      {
        label: "One I was wrong",
        message: "Good for one 'you were right', said out loud.",
      },
      { label: "One catch-up", message: "Good for a walk and a proper catch-up." },
      { label: "Your song", message: "Good for one favourite song, chosen by you." },
    ],
  },
};
