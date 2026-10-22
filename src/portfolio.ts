export const portfolio = {
  name: 'John Mark Rosales',
  title: 'Front-End Developer',
  location: 'Marikina City, Philippines',
  phone: '09064906419',
  email: 'johnybravo15@yahoo.com',
  summary:
    'Front-End Developer with 4+ years of experience delivering responsive web applications for enterprise clients in healthcare, energy, banking, and real estate. Experienced in reusable UI components, design-to-code implementation, REST/GraphQL integration, and SaaS customization. Skilled in React, Next.js, TypeScript, JavaScript, and Angular, with experience in testing, accessibility, and collaborative UI/UX delivery.',
  skills: [
    { label: 'Languages', items: ['JavaScript (ES6+)', 'TypeScript', 'HTML5', 'CSS3'] },
    { label: 'Frameworks', items: ['React', 'Next.js', 'Angular', 'jQuery', 'Tailwind CSS', 'Bootstrap', 'SASS'] },
    { label: 'Architecture & APIs', items: ['Redux', 'Micro Frontends', 'Monorepos', 'REST APIs', 'GraphQL', 'WebSockets'] },
    { label: 'Testing & Quality', items: ['Jest', 'Storybook', 'ESLint', 'Prettier'] },
    { label: 'Platforms & Tools', items: ['Sitecore XM Cloud', 'Microsoft Dynamics 365 CRM/Portal', 'Git', 'Webpack', 'Vite', 'npm', 'Azure DevOps', 'Jira', 'Confluence', 'Figma', 'Adobe XD', 'Chrome DevTools'] },
    { label: 'Additional Knowledge', items: ['Node.js', 'Express.js', 'Python', 'Java', 'SQL', 'MongoDB', 'Firebase', 'Mongoose', 'Vue.js', 'GitHub Copilot', 'Claude Code'] },
  ],
  projects: [
    {
      name: 'Internal Angular Project',
      technologies: ['Angular', 'SASS', 'Bootstrap', 'Jest', 'WebSockets'],
      description: 'Translated Figma designs into functional components and addressed ESLint/Prettier issues to support consistent code quality.',
    },
    {
      name: 'Australian Health Insurance',
      technologies: ['Sitecore XM Cloud', 'Next.js', 'GraphQL', 'Storybook', 'Monorepo'],
      description: 'Customized platform forms, built seven forms and supporting APIs, and contributed to authorization-related work.',
    },
    {
      name: 'Australian Energy Company',
      technologies: ['Microsoft Dynamics 365 CRM/Portal', 'JavaScript', 'jQuery', 'Bootstrap'],
      description: 'Built custom components to fill platform functionality gaps and collaborated with designers to tailor the UI/UX.',
    },
    {
      name: 'Japanese Banking Project',
      technologies: ['JavaScript', 'HTML', 'SASS', 'Handlebars'],
      description: 'Converted Figma designs into working interfaces and developed reusable components for other developers.',
    },
    {
      name: 'Japanese Real Estate Project',
      technologies: ['React', 'TypeScript', 'Redux', 'SASS', 'Jest'],
      description: 'Converted Adobe XD designs into functional React components and contributed to user-interface improvements.',
    },
  ],
} as const;
