export interface Question {
  question: string;
  choices: string[];
  correctAnswer: number;
}

export interface GameMetadata {
  startTime: number;
  totalPoints: number;
  totalPlayers: number;
  questions: Question[];
}
