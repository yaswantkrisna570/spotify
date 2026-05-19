require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const mm = require("music-metadata");
const sharp = require("sharp");

// =========================
// CLOUDINARY CONFIG
// =========================

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

// =========================
// FOLDERS
// =========================

const playlistsFolder = path.join(
  __dirname,
  "compressed"
);

const outputFolder = path.join(
  __dirname,
  "generated-json"
);

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// =========================
// CLEAN TEXT
// =========================

function cleanText(text) {
  return text
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/official/gi, "")
    .replace(/video/gi, "")
    .replace(/audio/gi, "")
    .replace(/lyrics/gi, "")
    .replace(/full song/gi, "")
    .replace(/mp3/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// =========================
// EXTRACT EMBEDDED COVER
// =========================

async function extractEmbeddedCover(
  songPath,
  outputPath
) {
  try {
    const metadata =
      await mm.parseFile(songPath);

    const picture =
      metadata.common.picture?.[0];

    if (!picture) {
      return null;
    }

    await sharp(picture.data)
      .resize(500, 500)
      .webp({ quality: 80 })
      .toFile(outputPath);

    return outputPath;
  } catch {
    return null;
  }
}

// =========================
// FETCH ONLINE ARTWORK
// =========================

async function fetchOnlineArtwork(
  title,
  artist
) {
  // ========= DEEZER =========

  try {
    const deezer =
      await axios.get(
        `https://api.deezer.com/search?q=${encodeURIComponent(
          `${title} ${artist}`
        )}`
      );

    const song =
      deezer.data?.data?.[0];

    if (song?.album?.cover_xl) {
      return song.album.cover_xl;
    }
  } catch {}

  // ========= ITUNES =========

  try {
    const itunes =
      await axios.get(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          `${title} ${artist}`
        )}&limit=1`
      );

    const result =
      itunes.data?.results?.[0];

    if (result?.artworkUrl100) {
      return result.artworkUrl100.replace(
        "100x100",
        "1000x1000"
      );
    }
  } catch {}

  return "";
}

// =========================
// GET SONG METADATA
// =========================

async function getSongMetadata(
  filename,
  filePath
) {
  try {
    const metadata =
      await mm.parseFile(filePath);

    const title =
      metadata.common.title ||
      cleanText(filename);

    const artist =
      metadata.common.artist ||
      "Unknown Artist";

    const onlineCover =
      await fetchOnlineArtwork(
        title,
        artist
      );

    return {
      title,
      artist,
      cover: onlineCover,
    };
  } catch {
    return {
      title: cleanText(filename),
      artist: "Unknown Artist",
      cover: "",
    };
  }
}

// =========================
// UPLOAD AUDIO
// =========================

async function uploadAudio(
  filePath,
  folder
) {
  const result =
    await cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: "video",
      }
    );

  return result.secure_url;
}

// =========================
// UPLOAD IMAGE
// =========================

async function uploadImage(
  filePath,
  folder
) {
  const result =
    await cloudinary.uploader.upload(
      filePath,
      {
        folder,
      }
    );

  return result.secure_url;
}

// =========================
// PROCESS PLAYLISTS
// =========================

async function processPlaylists() {
  const playlists =
    fs.readdirSync(playlistsFolder);

  for (const playlistName of playlists) {
    const songsFolder = path.join(
      playlistsFolder,
      playlistName
    );

    const files = fs
      .readdirSync(songsFolder)
      .filter((file) =>
        file.endsWith(".mp3")
      );

    const songs = [];

    for (const file of files) {
      try {
        console.log(
          `\n🎵 Processing: ${file}`
        );

        const fullPath = path.join(
          songsFolder,
          file
        );

        const fileNameWithoutExt =
          path.parse(file).name;

        // ========= METADATA =========

        const metadata =
          await getSongMetadata(
            fileNameWithoutExt,
            fullPath
          );

        // ========= EMBEDDED COVER =========

        const tempCover =
          path.join(
            __dirname,
            "temp-cover.webp"
          );

        const embeddedCover =
          await extractEmbeddedCover(
            fullPath,
            tempCover
          );

        // ========= AUDIO =========

        const audioUrl =
          await uploadAudio(
            fullPath,
            `spotify-clone/${playlistName}/songs`
          );

        // ========= COVER =========

        let coverUrl =
          metadata.cover;

        // ONLY use embedded cover
        // if online cover unavailable

        if (
          embeddedCover &&
          !coverUrl
        ) {
          coverUrl =
            await uploadImage(
              embeddedCover,
              `spotify-clone/${playlistName}/covers`
            );
        }

        // ========= SONG OBJECT =========

        songs.push({
          id:
            Date.now().toString() +
            Math.random()
              .toString(36)
              .substring(2, 8),

          title:
            metadata.title ||
            fileNameWithoutExt,

          artist:
            metadata.artist ||
            "Unknown Artist",

          cover: coverUrl || "",

          audio: audioUrl,
        });

        console.log(
          `✅ ${metadata.title} - ${metadata.artist}`
        );
      } catch (err) {
        console.log(
          `❌ Failed: ${file}`
        );
      }
    }

    // ========= SAVE JSON =========

    const outputPath = path.join(
      outputFolder,
      `${playlistName}.json`
    );

    fs.writeFileSync(
      outputPath,
      JSON.stringify(songs, null, 2)
    );

    console.log(
      `\n🔥 JSON CREATED: ${playlistName}.json`
    );
  }
}

processPlaylists();