const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

const playlistsFolder = path.join(__dirname, "playlists");
const outputFolder = path.join(__dirname, "compressed");

// IMPORTANT:
// Replace this path with YOUR actual ffmpeg.exe path
const ffmpegPath =
  "C:\\Users\\yaswa\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.1-essentials_build\\bin\\ffmpeg.exe";

// Create compressed folder if missing
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Compress single song
async function compressSong(input, output) {
  return new Promise((resolve, reject) => {
    const command = `"${ffmpegPath}" -y -i "${input}" -b:a 128k "${output}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log("\n==============================");
        console.log("FFMPEG ERROR:");
        console.log(stderr);
        console.log("==============================\n");

        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Process all playlists
async function processPlaylists() {
  // Check playlists folder exists
  if (!fs.existsSync(playlistsFolder)) {
    console.log("❌ playlists folder not found!");
    return;
  }

  const playlists = fs.readdirSync(playlistsFolder);

  if (playlists.length === 0) {
    console.log("❌ No playlists found!");
    return;
  }

  for (const playlist of playlists) {
    const songsFolder = path.join(
      playlistsFolder,
      playlist,
      "songs"
    );

    // Skip if songs folder missing
    if (!fs.existsSync(songsFolder)) {
      console.log(`❌ songs folder missing for ${playlist}`);
      continue;
    }

    // Create output playlist folder
    const outputPlaylistFolder = path.join(
      outputFolder,
      playlist
    );

    fs.ensureDirSync(outputPlaylistFolder);

    const files = fs.readdirSync(songsFolder);

    // Filter only MP3 files
    const mp3Files = files.filter((file) =>
      file.toLowerCase().endsWith(".mp3")
    );

    if (mp3Files.length === 0) {
      console.log(`❌ No mp3 songs inside ${playlist}`);
      continue;
    }

    for (const file of mp3Files) {
      const inputPath = path.join(songsFolder, file);

      const outputPath = path.join(
        outputPlaylistFolder,
        file
      );

      console.log(`\n🎵 Compressing: ${file}`);

      try {
        await compressSong(inputPath, outputPath);

        console.log(`✅ Finished: ${file}`);
      } catch (err) {
        console.log(`❌ Failed: ${file}`);
      }
    }
  }

  console.log("\n🔥 ALL SONGS COMPRESSED SUCCESSFULLY");
}

processPlaylists();