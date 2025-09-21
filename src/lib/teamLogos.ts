// A mapping of team names to their logo URLs.
const teamLogoMap: { [key: string]: string } = {
  // Premier League
  'Arsenal': '/アーセナル.png',
  'Aston Villa': '/アストン・ヴィラ.png',
  'Bournemouth': '/ボーンマス.png',
  'Brentford': '/ブレントフォード.png',
  'Brighton': '/ブライトン.png',
  'Burnley': '/バーンリー.png',
  'Chelsea': '/チェルシー.png',
  'Crystal Palace': '/クリスタルパレス.png',
  'Everton': '/エバートン.png',
  'Fulham': '/フラム.png',
  'Leeds': '/リーズユナイテッド.png',
  'Liverpool': '/リバプール.png',
  'Man City': '/マンチェスターシティ.png',
  'Man Utd': '/マンチェスターユナイテッド.png',
  'Newcastle': '/ニューカッスル.png',
  'Nottm Forest': '/ノッティンガムフォレスト.png',
  'Sunderland': '/サンダーランド.png',
  'Tottenham': '/トッテナム.png',
  'West Ham': '/ウェストハム.png',
  'Wolves': '/ウォルバーハンプトン.png',

  // Europa League & Others
  'Swansea': '', // No logo file found
  'Real Betis': '/Real Betis.png',
  'FC Midtjylland': '/FC Midtjylland.png',
  'FC Porto': '/ポルト.png',
  'Sturm Graz': '/Sturm Graz.png',
  'Malmö FF': '/マルメ.png',
  'FC Utrecht': '/ユトレヒト.png',
  'Braga': '/ブラガ.png',
  'Ferencvaros': '/Ferencvaros.png',
};

export const getTeamLogo = (teamName: string) => {
  const logo = teamLogoMap[teamName];
  return logo || `https://placehold.co/48x48/2d3748/ffffff/png?text=N/A`; // Default 'NO IMAGE' placeholder
};
