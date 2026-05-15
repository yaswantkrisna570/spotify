require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// IMPORTANT:
// Now reading from COMPRESSED folder
const playlistsFolder = path.join(__dirname, "compressed");

const outputFolder = path.join(__dirname, "generated-json");

// Create generated-json folder if missing
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Upload file to Cloudinary
async function uploadToCloudinary(
  filePath,
  folder,
  resourceType
) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
  });

  return result.secure_url;
}

// Fetch cover image automatically
async function getCoverImage(title, artist) {
  try {
    const query = `${title} ${artist}`;

    const response = await axios.get(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        query
      )}&limit=1`
    );

    if (response.data.results.length > 0) {
      return response.data.results[0].artworkUrl100.replace(
        "100x100",
        "1000x1000"
      );
    }

    return null;
  } catch (error) {
    console.log("❌ Cover fetch failed");
    return null;
  }
}

// Main process
async function processPlaylists() {
  // Check compressed folder exists
  if (!fs.existsSync(playlistsFolder)) {
    console.log("❌ compressed folder not found!");
    return;
  }

  const playlists = fs.readdirSync(playlistsFolder);

  if (playlists.length === 0) {
    console.log("❌ No playlists found!");
    return;
  }

  for (const playlistName of playlists) {
    // IMPORTANT:
    // Songs now directly inside compressed/<playlist>
    const songsFolder = path.join(
      playlistsFolder,
      playlistName
    );

    if (!fs.existsSync(songsFolder)) {
      console.log(`❌ Folder missing: ${playlistName}`);
      continue;
    }

    const files = fs.readdirSync(songsFolder);

    // Filter mp3 files only
    const mp3Files = files.filter((file) =>
      file.toLowerCase().endsWith(".mp3")
    );

    if (mp3Files.length === 0) {
      console.log(`❌ No mp3 songs inside ${playlistName}`);
      continue;
    }

    const songs = [];

    for (const file of mp3Files) {
      console.log(`\n🎵 Processing: ${file}`);

      const fullPath = path.join(songsFolder, file);

      const nameWithoutExt = path.parse(file).name;

      // Split title and artist
      const split = nameWithoutExt.split(" - ");

      const title = split[0] || "Unknown";
      const artist = split[1] || "Unknown";

      // Upload MP3
      const audioUrl = await uploadToCloudinary(
        fullPath,
        `spotify-clone/${playlistName}/songs`,
        "video"
      );

      // Fetch cover image
      const coverImage = await getCoverImage(
        title,
        artist
      );

      let coverUrl = "";

      // Upload cover image
      if (coverImage) {
        try {
          const imageUpload =
            await cloudinary.uploader.upload(
              coverImage,
              {
                folder: `spotify-clone/${playlistName}/covers`,
              }
            );

          coverUrl = imageUpload.secure_url;
        } catch {
          console.log("❌ Cover upload failed");
        }
      }

      // Add song object
      songs.push({
        title,
        artist,
        audio: audioUrl,
        cover: coverUrl,
      });

      console.log(`✅ Finished: ${title}`);
    }

    // Save JSON
    const outputPath = path.join(
      outputFolder,
      `${playlistName}.json`
    );

    fs.writeFileSync(
      outputPath,
      JSON.stringify(songs, null, 2)
    );

    console.log(
      `\n🔥 JSON created: ${playlistName}.json`
    );
  }
}

// Start process
processPlaylists();