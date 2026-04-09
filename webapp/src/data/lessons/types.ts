export interface Lesson {
  id: string;
  title: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  certRelevance: ("PD1" | "PD2" | "JS-Dev-I" | "Integration-Arch")[];
  content: string; // markdown riche
  tsAnalogy?: string; // markdown
  gotchas: string[];
}
