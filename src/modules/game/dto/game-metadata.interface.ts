export interface Question {
  question: string;
  choices: string[];
  correctAnswer: number;
}

export interface GameMetadata {
  startTime: number;
  questions: Question[];
}
