# Musicripts 🎵

A Node.js application that helps you download music from various sources, normalize audio levels, set metadata from Spotify, and manage your music library with Navidrome integration.

This application is designed to run on a server alongside a music server (like Navidrome). The typical setup involves configuring it as a cron job to periodically download music from your configured sources, automatically processing and adding them to your music library.

## Features

- 📥 Download songs from YouTube URLs or playlists
- 🎵 Convert videos to MP3 format
- 📊 Normalize audio levels using mp3gain
- 🎼 Fetch and set metadata from Spotify (title, artist, album, cover art, etc.)
- 🔄 Automatic Navidrome library scanning
- 📱 Telegram notifications for downloaded songs

## Prerequisites

### System Requirements

- Node.js >= 22.0.0
- Docker (for production environment)

### Dependencies

The following command-line tools must be installed on your system:

- `yt-dlp` - For downloading YouTube videos
- `ffmpeg` - For audio processing
- `mp3gain` - For audio normalization
- `docker` - Required in production for Navidrome integration

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
TELEGRAM_CHAT_ID=your_telegram_chat_id
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

NODE_ENV=development # Set to 'production' in production environments
OUTPUT_DIR=your_output_directory_to_save_song_files
DOWNLOADS_ARCHIVE_PATH=your_youtube_archive_path
NAVIDROME_PATH=/app/navidrome

# Development Only
DEVELOPMENT_PLAYLISTS_GIST_URL=your_playlists_gist_url
DEVELOPMENT_SONGS_GIST_URL=your_songs_gist_url
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/musicripts.git
   cd musicripts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development Mode

Run the application in development mode with hot reloading:

```bash
npm run dev
```

### Production Mode

1. Build the application:

   ```bash
   npm run build
   ```

2. Run the application with a specific download source:

   ```bash
   node dist/main.js --from <source> --url <url>
   ```

   Example with a songs gist:

   ```bash
   node dist/main.js --from songs-gist --url https://gist.github.com/yourusername/your-gist-url/raw/songs
   ```

   Example with a YouTube playlist:

   ```bash
   node dist/main.js --from playlist --url https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID
   ```

### Download Sources

The application supports different download sources using the `--from` parameter:

1. Single Song URL (`--from song`):

   - Direct YouTube video URL
   - Example: `--from song --url https://www.youtube.com/watch?v=VIDEO_ID`

2. Playlist URL (`--from playlist`):

   - YouTube playlist URL
   - Example: `--from playlist --url https://www.youtube.com/playlist?list=PLAYLIST_ID`

3. Gist Sources:
   - Songs Gist (`--from songs-gist`): List of individual song URLs
   - Playlists Gist (`--from playlists-gist`): List of playlist URLs
   - Example: `--from songs-gist --url https://gist.github.com/username/gist-id/raw/songs`

## Project Structure

```
src/
├── config.ts           # Environment and dependency configuration
├── constants.ts        # Common constants and title tags
├── main.ts            # Application entry point
├── types.ts           # Common types and enums
└── modules/
    ├── app-initializer/    # Application initialization and checks
    ├── download-sources/   # Download source handling
    ├── downloader/         # YouTube download functionality
    ├── logger/            # Console logging utilities
    ├── metadater/         # Spotify metadata integration
    ├── music-server/      # Navidrome integration
    ├── normalizer/        # Audio normalization
    └── notifier/          # Telegram notifications
```

## Flow

1. **Initialization**: Checks environment variables and dependencies
2. **Download Source**: Gets URLs from the specified source
3. **Download**: Converts videos to MP3
4. **Normalization**: Adjusts audio levels
5. **Metadata**: Fetches and sets Spotify metadata
6. **Music Server**: Rescans Navidrome library
7. **Notification**: Sends Telegram notification with download summary

## Error Handling

The application includes comprehensive error handling for:

- Missing environment variables
- Missing system dependencies
- Download failures
- Metadata fetch/set errors
- Normalization issues
- Music server communication
- Notification delivery

## Development

### Available Scripts

- `npm run dev`: Start in development mode with hot reloading
- `npm run build`: Build the TypeScript project
- `npm start`: Run the built application
- `npm test`: Run tests (to be implemented)

### Adding New Features

1. Create new modules in `src/modules/`
2. Update types in `src/types.ts`
3. Add error handling cases in `ErrorTypes`
4. Update the main application flow in `main.ts`

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
