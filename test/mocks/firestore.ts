// Mock minimal de firebase/firestore pour les tests unitaires.
// On ne réimplémente que ce que la logique pure utilise : Timestamp.
export class Timestamp {
  constructor(
    public readonly seconds: number,
    public readonly nanoseconds: number,
  ) {}

  static fromDate(date: Date): Timestamp {
    const ms = date.getTime();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }

  static fromMillis(ms: number): Timestamp {
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1e6);
  }

  static now(): Timestamp {
    return Timestamp.fromMillis(Date.now());
  }

  toDate(): Date {
    return new Date(this.seconds * 1000 + Math.round(this.nanoseconds / 1e6));
  }

  toMillis(): number {
    return this.seconds * 1000 + Math.round(this.nanoseconds / 1e6);
  }
}
