export const masterLibrary = {
  all: [
    {
      id: 1,
      title: "Oru Pere Varalaaru",
      artist: "Anirudh Ravichander",
      cover: "https://res.cloudinary.com/dyfejeqp1/image/upload/v1778604366/oru_pere_varalaaru_tgri8o.jpg",
      audio: "https://res.cloudinary.com/dyfejeqp1/video/upload/v1778599791/Oru-Pere-Varalaaru-MassTamilan.dev_gtkwaq.mp3"
    },
    {
      id: 2,
      title: "Pavazha Malli",
      artist: "Sai Abhyankkar",
      cover: "https://res.cloudinary.com/dyfejeqp1/image/upload/v1778604366/pavazha_malli_kikgjn.jpg",
      audio: "https://res.cloudinary.com/dyfejeqp1/video/upload/v1778599792/Pavazha_Malli_elfjp3.mp3"
    },
    {
      id: 3,
      title: "Kutti Story",
      artist: "Anirudh Ravichander",
      cover: "https://res.cloudinary.com/dyfejeqp1/image/upload/v1778604366/kutti_story_jv4hke.jpg",
      audio: "https://res.cloudinary.com/dyfejeqp1/video/upload/v1778599811/Kutti-Story-MassTamilan.io_w6ule5.mp3"
    }
  ]
};

export const PLAYLISTS = {
  'daily-mix-1': {
    id: 'daily-mix-1',
    title: 'Daily Mix 1',
    artist: 'Anirudh, Harris Jayaraj & more',
    image: '/album_cover_1.png',
    description: 'Made for Yaswanth. A blend of your favorite tracks.',
    gradient: 'from-blue-900 to-black',
    songs: masterLibrary.all
  },
  'lofi-beats': {
    id: 'lofi-beats',
    title: 'Lofi Beats',
    artist: 'Lofi Girl, Chillhop Music',
    image: '/album_cover_3.png',
    description: 'Beats to study/relax to.',
    gradient: 'from-indigo-900 to-black',
    songs: [masterLibrary.all[1], masterLibrary.all[2]]
  },
  'pop': {
    id: 'pop',
    title: 'Pop',
    artist: 'Spotify',
    image: 'https://res.cloudinary.com/dyfejeqp1/image/upload/v1778604366/oru_pere_varalaaru_tgri8o.jpg',
    description: 'The biggest hits of the moment.',
    gradient: 'from-purple-900 to-black',
    color: 'bg-[#8d67ab]',
    songs: masterLibrary.all
  },
  'synthwave': {
    id: 'synthwave',
    title: 'Synthwave',
    artist: 'Spotify',
    image: '/album_cover_3.png',
    description: 'Night calls and neon lights.',
    gradient: 'from-pink-900 to-black',
    color: 'bg-[#e91e63]',
    songs: [masterLibrary.all[0], masterLibrary.all[2]]
  }
};
