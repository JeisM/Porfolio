import { useEffect, useMemo, useState, type ReactNode } from 'react';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import HomeRounded from '@mui/icons-material/HomeRounded';
import LayersRounded from '@mui/icons-material/LayersRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import SchoolRounded from '@mui/icons-material/SchoolRounded';
import TerminalRounded from '@mui/icons-material/TerminalRounded';
import WorkOutlineRounded from '@mui/icons-material/WorkOutlineRounded';
import type { IconType } from 'react-icons';
import {
  SiAngular,
  SiBootstrap,
  SiCss,
  SiEslint,
  SiExpress,
  SiFigma,
  SiFirebase,
  SiGit,
  SiGraphql,
  SiHtml5,
  SiJavascript,
  SiJest,
  SiJquery,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiNpm,
  SiPrettier,
  SiPython,
  SiReact,
  SiRedux,
  SiSass,
  SiStorybook,
  SiTailwindcss,
  SiTypescript,
  SiVite,
  SiVuedotjs,
  SiWebpack,
} from 'react-icons/si';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CssBaseline,
  IconButton,
  Link,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { portfolio } from './portfolio';

type Mode = 'light' | 'dark';

const nav = [
  ['Home', 'home', HomeRounded],
  ['About', 'about', TerminalRounded],
  ['Skills', 'skills', LayersRounded],
  ['Experience', 'experience', WorkOutlineRounded],
  ['Education', 'education', SchoolRounded],
] as const;

const skillIcons: Record<string, IconType> = {
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
  GraphQL: SiGraphql,
  Jest: SiJest,
  Storybook: SiStorybook,
  ESLint: SiEslint,
  Prettier: SiPrettier,
  Git: SiGit,
  Webpack: SiWebpack,
  Vite: SiVite,
  npm: SiNpm,
  Figma: SiFigma,
  'Node.js': SiNodedotjs,
  'Express.js': SiExpress,
  Python: SiPython,
  MongoDB: SiMongodb,
  Firebase: SiFirebase,
  'Vue.js': SiVuedotjs,
};

function SkillChip({ skill }: { skill: string }) {
  const Icon = skillIcons[skill];
  return <Chip icon={Icon ? <Icon aria-hidden="true" /> : undefined} label={skill} size="small" />;
}

function getInitialMode(): Mode {
  try {
    const stored = localStorage.getItem('portfolio-color-mode');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage may be unavailable in privacy-restricted contexts.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function Section({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Box component="section" id={id} className="glass-panel section-card" aria-labelledby={`${id}-title`}>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
        <Box className="section-icon">{icon}</Box>
        <Typography id={`${id}-title`} component="h2" variant="h6">{title}</Typography>
      </Stack>
      {children}
    </Box>
  );
}

export function App() {
  const [mode, setMode] = useState<Mode>(getInitialMode);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [navBounce, setNavBounce] = useState<'a' | 'b' | null>(null);
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#8bc7ff' : '#1768d2' },
      background: { default: mode === 'dark' ? '#07152e' : '#dcecff', paper: mode === 'dark' ? '#102346' : '#f6faff' },
      text: { primary: mode === 'dark' ? '#f3f7ff' : '#082a64', secondary: mode === 'dark' ? '#b9cceb' : '#37649f' },
    },
    typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', h6: { fontWeight: 750, fontSize: '1rem' } },
    shape: { borderRadius: 18 },
    components: { MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700, borderRadius: 999, minHeight: 44 } } } },
  }), [mode]);

  useEffect(() => {
    try { localStorage.setItem('portfolio-color-mode', mode); } catch { /* handled on read */ }
  }, [mode]);

  useEffect(() => {
    document.documentElement.dataset.colorMode = mode;
    return () => {
      delete document.documentElement.dataset.colorMode;
    };
  }, [mode]);

  useEffect(() => {
    if (!window.IntersectionObserver) return undefined;
    const sections = nav
      .map(([, id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, { rootMargin: '-22% 0px -58% 0px', threshold: [0.05, 0.35, 0.65] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 24);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  const switchMode = () => setMode((current) => (current === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={`site-shell mode-${mode}`}>
        <Box component="aside" className={`sidebar ${isScrolled ? 'is-scrolled' : ''}`} aria-label="Primary navigation">
          <Box component="nav" className="side-nav">
            {nav.map(([label, id, Icon]) => (
              <Link
                key={id}
                href={`#${id}`}
                className={activeSection === id ? 'active' : ''}
                aria-current={activeSection === id ? 'page' : undefined}
                onClick={() => setNavBounce((current) => current === 'a' ? 'b' : 'a')}
              >
                <Icon fontSize="small" /><span>{label}</span>
              </Link>
            ))}
          </Box>
          <Box className="sidebar-bottom">
            <IconButton onClick={switchMode} color="inherit" aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
            </IconButton>
          </Box>
        </Box>

        <Box component="main" className={`content${navBounce ? ` nav-bounce-${navBounce}` : ''}`}>
          <Box component="header" id="home" className="hero glass-panel">
            <Box className="hero-orb orb-one" /><Box className="hero-orb orb-two" />
            <Box className="mobile-header">
              <IconButton onClick={switchMode} color="inherit" aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
                {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
              </IconButton>
            </Box>
            <Box className="availability"><span /> Available for new opportunities</Box>
            <Box className="hero-content">
              <Avatar
                className="profile-mark"
                src="/john-mark-rosales.jpg"
                alt="John Mark Rosales at a waterfall"
              />
              <Box className="intro">
                <Typography variant="body1" sx={{ opacity: 0.78 }}>Hello, I&apos;m</Typography>
                <Typography component="h1">{portfolio.name}</Typography>
                <Typography className="eyebrow">{portfolio.title}</Typography>
                <Stack className="contact-details" direction="row" flexWrap="wrap" gap={2}>
                  <span><LocationOnOutlined /> {portfolio.location}</span>
                  <span><PhoneOutlined /> {portfolio.phone}</span>
                  <span><EmailOutlined /> {portfolio.email}</span>
                </Stack>
                <Button className="shine-button" component="a" href={`mailto:${portfolio.email}`} variant="contained" startIcon={<EmailOutlined />}><span>Get in touch</span></Button>
              </Box>
              <Typography className="hero-statement">Building modern web experiences with clean code and thoughtful design.</Typography>
            </Box>
          </Box>

          <Box className="dashboard-grid">
            <Box className="left-column">
              <Section id="about" title="Professional Summary" icon={<TerminalRounded />}>
                <Typography color="text.secondary" className="summary-text">{portfolio.summary}</Typography>
              </Section>
              <Section id="experience" title="Professional Experience" icon={<WorkOutlineRounded />}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ mb: 2, gap: 0.5 }}>
                  <Box><Typography fontWeight={800}>Accenture Philippines</Typography><Typography color="text.secondary" variant="body2">Front-End Developer / Software Engineer</Typography></Box>
                  <Typography color="text.secondary" variant="caption">August 2021 – May 2026</Typography>
                </Stack>
                <Stack spacing={1.6}>
                  {portfolio.projects.map((project) => <Box key={project.name} className="project-row">
                    <Box><Typography fontWeight={750} variant="body2">{project.name}</Typography><Typography color="text.secondary" variant="caption">{project.description}</Typography></Box>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.7 }}>{project.technologies.map((item) => <Chip key={item} label={item} size="small" />)}</Stack>
                  </Box>)}
                </Stack>
              </Section>
            </Box>
            <Box className="right-column">
              <Section id="skills" title="Technical Skills" icon={<LayersRounded />}>
                <Stack spacing={1.5}>{portfolio.skills.map((group) => <Box key={group.label}><Typography fontWeight={750} variant="body2" sx={{ mb: 0.65 }}>{group.label}</Typography><Stack direction="row" flexWrap="wrap" gap={0.6}>{group.items.map((item) => <SkillChip key={item} skill={item} />)}</Stack></Box>)}</Stack>
              </Section>
              <Section id="education" title="Education" icon={<SchoolRounded />}>
                <Typography fontWeight={750} variant="body2">Bachelor of Science in Information Technology</Typography>
                <Typography color="text.secondary" variant="body2">ICCT Colleges, Cainta, Philippines</Typography>
                <Typography color="text.secondary" variant="caption">March 2012 – March 2016</Typography>
              </Section>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
