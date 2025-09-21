import { Timestamp } from 'firebase/firestore';

// For News articles
export interface News {
  id: string; // Firestore document ID
  title: string;
  imageUrl: string;
  category: string;
  date: string; // ISO 8601 format string
  slug: string;
  content?: string; // For the detail page
  createdAt: Timestamp;
}

// For YouTube Links
export interface YoutubeLink {
  id?: string;
  title: string;
  videoId: string;
  order: number;
  createdAt: Timestamp;
}

// --- Player & Match Records --- //

// Player Master Data
export interface Player {
  id?: string;
  name: string;
  photoUrl: string;       // 顔写真のURL
  position: string;       // 例: 'GK', 'CB, RB', 'DM, CM'
  nationality: string;    // 例: 'ブラジル'
  jerseyNumber: number;
  dateOfBirth: string;    // 'YYYY-MM-DD' 形式
  height: number;         // cm単位
  status?: string;        // 例: 'ハムストリング損傷 - 9月 2025下旬'
  createdAt: Timestamp;
}

// Stats for a single player in a single match
export interface PlayerStat {
  playerId: string; // Reference to the Player's ID in the master list
  name: string;     // Player's name for display purposes
  goals: number;
  assists: number;
  rating: number; // 10点満点評価
}

// Stats for the team in a single match
export interface TeamStats {
  possession: number; // ポゼッション率 (%)
  shots: number; // シュート数
  shotsOnTarget: number; // 枠内シュート数
}

// Record for a single match played
export interface MatchRecord {
  id?: string;
  date: string;
  competition: string;
  opponent: string;
  isHome: boolean;
  homeTeam: string;
  awayTeam: string;
  scoreHome: number;
  scoreAway: number;
  result: 'Win' | 'Draw' | 'Loss';
  season: string; // e.g., '2025-2026'
  matchWeek?: number;
  playerStats: PlayerStat[];
  teamStats: TeamStats;
  createdAt: Timestamp;
}

// --- Deprecated / To be reviewed --- //

// This seems to be for displaying public match fixtures, not for recording game results.
// We will keep it for now to avoid breaking other parts of the site.
// For upcoming match fixtures
export interface Fixture {
  id?: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM'
  competition: string;
  homeTeam: string;
  awayTeam: string;
  venue?: 'Home' | 'Away';
  matchWeek?: number;
  createdAt: Timestamp;
}

// --- Deprecated / To be reviewed --- //

// This seems to be for displaying public match fixtures, not for recording game results.
// We will keep it for now to avoid breaking other parts of the site.
export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeScore?: number;
  awayScore?: number;
  date: string; // ISO 8601 format string
  competition: string;
  status: 'Fixture' | 'Full-Time';
}
