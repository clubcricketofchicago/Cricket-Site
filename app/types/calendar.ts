export interface Game {
  fixtureId: number;
  fixedFormatDate: string;
  time?: string;
  seriesName: string;
  t1_logo_file_path: string;
  t2_logo_file_path: string;
  teamOneName: string;
  teamTwoName: string;
  ground: string;
  location: string;
  title: string;
}

export interface CalendarEleProps {
  date: Date;
  gamesLookUp: Game[];
  handleClick: (game: Game) => void;
  notFoundClick: () => void;
}

export interface MatchDisplayEleProps {
  bgColor: string;
  game: Game;
} 