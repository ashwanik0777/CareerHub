export const SKILL_CATEGORIES = {
  "Languages": ["JavaScript", "TypeScript", "Python", "Java", "C++", "C", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "R", "SQL", "HTML", "CSS"],
  "Frontend": ["React", "Angular", "Vue", "Next.js", "Svelte", "Tailwind CSS", "Bootstrap", "jQuery", "Material UI", "Redux", "Zustand"],
  "Backend": ["Node.js", "Express", "Django", "Flask", "Spring Boot", "FastAPI", "Laravel", "ASP.NET", "NestJS", "GraphQL", "REST API"],
  "Database": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Firebase", "DynamoDB", "Cassandra", "Elasticsearch", "Prisma", "Mongoose"],
  "Cloud/DevOps": ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "CI/CD", "Terraform", "Nginx", "Linux", "Jenkins", "GitHub Actions", "GitLab CI"],
  "AI/ML": ["TensorFlow", "PyTorch", "Scikit-learn", "NLP", "Computer Vision", "LLMs", "Pandas", "NumPy", "OpenCV", "Hugging Face"],
  "Mobile": ["React Native", "Flutter", "SwiftUI", "Android SDK", "iOS SDK", "Ionic", "Xamarin"],
  "Tools & Other": ["Git", "VS Code", "Figma", "Postman", "Jira", "Trello", "Webpack", "Vite", "Jest", "Cypress", "Mocha"]
};

export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flat().sort();
