import type { ElementType } from 'react';
import { Chip } from '@mui/material';
import AccountTreeRounded from '@mui/icons-material/AccountTreeRounded';
import ApiRounded from '@mui/icons-material/ApiRounded';
import CableRounded from '@mui/icons-material/CableRounded';
import CodeRounded from '@mui/icons-material/CodeRounded';
import WidgetsOutlined from '@mui/icons-material/WidgetsOutlined';
import { FaDatabase, FaJava } from 'react-icons/fa6';
import { TbBrandAdobeXd } from 'react-icons/tb';
import { VscAzureDevops } from 'react-icons/vsc';
import {
  SiAngular, SiBootstrap, SiClaudecode, SiConfluence, SiCss, SiEslint,
  SiExpress, SiFigma, SiFirebase, SiGit, SiGithubcopilot, SiGooglechrome,
  SiGraphql, SiHtml5, SiJavascript, SiJest, SiJira, SiJquery,
  SiMongodb, SiMongoose, SiNextdotjs, SiNodedotjs, SiNpm, SiPrettier,
  SiPython, SiReact, SiRedux, SiSass, SiSitecore, SiStorybook,
  SiTailwindcss, SiTypescript, SiVite, SiVuedotjs, SiWebpack,
} from 'react-icons/si';
import { portfolio } from './portfolio';

type SkillName = typeof portfolio.skills[number]['items'][number];

const skillIcons: Record<string, ElementType> = {
  'JavaScript (ES6+)': SiJavascript,
  TypeScript: SiTypescript,
  HTML5: SiHtml5,
  CSS3: SiCss,
  React: SiReact,
  'Next.js': SiNextdotjs,
  Angular: SiAngular,
  jQuery: SiJquery,
  'Tailwind CSS': SiTailwindcss,
  Bootstrap: SiBootstrap,
  SASS: SiSass,
  Redux: SiRedux,
  'Micro Frontends': WidgetsOutlined,
  Monorepos: AccountTreeRounded,
  'REST APIs': ApiRounded,
  GraphQL: SiGraphql,
  WebSockets: CableRounded,
  Jest: SiJest,
  Storybook: SiStorybook,
  ESLint: SiEslint,
  Prettier: SiPrettier,
  'Sitecore XM Cloud': SiSitecore,
  'Microsoft Dynamics 365 CRM/Portal': WidgetsOutlined,
  Git: SiGit,
  Webpack: SiWebpack,
  Vite: SiVite,
  npm: SiNpm,
  'Azure DevOps': VscAzureDevops,
  Jira: SiJira,
  Confluence: SiConfluence,
  Figma: SiFigma,
  'Adobe XD': TbBrandAdobeXd,
  'Chrome DevTools': SiGooglechrome,
  'Node.js': SiNodedotjs,
  'Express.js': SiExpress,
  Python: SiPython,
  Java: FaJava,
  SQL: FaDatabase,
  MongoDB: SiMongodb,
  Firebase: SiFirebase,
  Mongoose: SiMongoose,
  'Vue.js': SiVuedotjs,
  'GitHub Copilot': SiGithubcopilot,
  'Claude Code': SiClaudecode,
} satisfies Record<SkillName, ElementType>;

export function SkillChip({ skill }: { skill: string }) {
  const Icon = skillIcons[skill] ?? CodeRounded;
  return <Chip className="skill-chip" icon={<Icon aria-hidden="true" />} label={skill} size="small" />;
}
