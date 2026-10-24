import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import { useSlideWheel } from './useSlideWheel';
import { useSlideSwipe } from './useSlideSwipe';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import { WeatherScene, type Scene } from './WeatherScene';
import { CvOverview } from './CvOverview';
import { SocialLinks } from './SocialLinks';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import ShareOutlined from '@mui/icons-material/ShareOutlined';
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
  Button,
  Chip,
  CssBaseline,
  IconButton,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { portfolio } from './portfolio';

type Mode = 'light' | 'dark';

const nav = [
  ['Summary', 'cv', DescriptionOutlined],
  ['Home', 'home', HomeRounded],
  ['About', 'about', TerminalRounded],
  ['Skills', 'skills', LayersRounded],
  ['Experience', 'experience', WorkOutlineRounded],
  ['Education', 'education', SchoolRounded],
  ['Social', 'social', ShareOutlined],
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

type SectionId = typeof nav[number][1];
const scenes: Record<SectionId, { scene: Scene; label: string }> = {
  home: { scene: 'sunny', label: 'Sunny skies' },
  about: { scene: 'clouds', label: 'Passing clouds' },
  experience: { scene: 'winter', label: 'Winter snowfall' },
  skills: { scene: 'autumn', label: 'Autumn breeze' },
  education: { scene: 'mist', label: 'Morning mist' },
  cv: { scene: 'clouds', label: 'Passing clouds' },
  social: { scene: 'sunny', label: 'Sunny skies' },
};

function sectionFromHash(): SectionId {
  return nav.find(([, id]) => `#${id}` === window.location.hash)?.[1] ?? nav[0][1];
}

function arcY(x: number) {
  return 18 + 72 * (1 - ((x - 500) / 500) ** 2);
}

function Section({ id, title, icon, children }: { id: string; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section id={`${id}-slide`} className="slide-body" aria-labelledby={`${id}-title`}>
      <div className="slide-heading">
        <div className="section-icon">{icon}</div>
        <Typography id={`${id}-title`} component="h1">{title}</Typography>
      </div>
      <div className="slide-copy">{children}</div>
    </section>
  );
}

export function App() {
  const [mode, setMode] = useState<Mode>(getInitialMode);
  const [activeSection, setActiveSection] = useState<SectionId>(sectionFromHash);
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [panelMotion, setPanelMotion] = useState<'none' | 'css' | 'native'>('none');
  const shellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<ViewTransition | null>(null);
  const transitionPending = useRef(false);
  const pendingFocus = useRef<string | null>(null);
  const [motionPaused, setMotionPaused] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const activeIndex = nav.findIndex(([, id]) => id === activeSection);
  const weather = scenes[activeSection];

  useLayoutEffect(() => {
    if (pendingFocus.current) {
      panelRef.current?.querySelector<HTMLButtonElement>(`button[aria-label="${pendingFocus.current}"]`)?.focus({ preventScroll: true });
      pendingFocus.current = null;
    }
  }, [activeSection]);

  useEffect(() => () => {
    transitionRef.current?.skipTransition();
    delete document.documentElement.dataset.panelDirection;
  }, []);
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#91cfff' : '#1265dc' },
      background: { default: mode === 'dark' ? '#0c1c38' : '#c6def5' },
      text: { primary: mode === 'dark' ? '#eef6ff' : '#071b61', secondary: mode === 'dark' ? '#c6d8f3' : '#435ba0' },
    },
    typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    components: { MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700, borderRadius: 999, minHeight: 44 } } } },
  }), [mode]);

  useEffect(() => {
    try { localStorage.setItem('portfolio-color-mode', mode); } catch { /* Storage can be unavailable. */ }
    document.documentElement.dataset.colorMode = mode;
    return () => { delete document.documentElement.dataset.colorMode; };
  }, [mode]);

  useEffect(() => {
    const syncHash = () => {
      const next = sectionFromHash();
      setDirection(nav.findIndex(([, id]) => id === next) >= activeIndex ? 'next' : 'previous');
      setActiveSection(next);
    };
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);
    return () => {
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('popstate', syncHash);
    };
  }, [activeIndex]);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => setMotionPaused(preference?.matches ?? false);
    preference?.addEventListener?.('change', update);
    return () => preference?.removeEventListener?.('change', update);
  }, []);

  const selectSection = useCallback((id: SectionId, movement?: 'next' | 'previous') => {
    if (id === activeSection) return;
    if (transitionPending.current) return;
    const nextDirection = movement ?? (nav.findIndex(([, section]) => section === id) > activeIndex ? 'next' : 'previous');
    const focused = document.activeElement;
    pendingFocus.current = focused instanceof HTMLButtonElement && focused.classList.contains('slide-button') ? focused.getAttribute('aria-label') : null;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const native = !reduced && typeof document.startViewTransition === 'function';
    const commit = () => {
      setDirection(nextDirection);
      setPanelMotion(reduced ? 'none' : native ? 'native' : 'css');
      window.history.pushState(null, '', `#${id}`);
      setActiveSection(id);
    };
    transitionRef.current?.skipTransition();
    document.documentElement.dataset.panelDirection = nextDirection;
    if (native) {
      transitionPending.current = true;
      transitionRef.current = document.startViewTransition(() => {
        try { flushSync(commit); } finally { transitionPending.current = false; }
      });
      void transitionRef.current.ready.catch(() => { /* A newer navigation can skip a pending snapshot. */ });
      void transitionRef.current.finished.catch(() => { /* Hidden tabs may skip the visual transition. */ });
    } else commit();
  }, [activeSection, activeIndex]);
  const moveSlide = useCallback((step: -1 | 1) => {
    const next = (activeIndex + step + nav.length) % nav.length;
    selectSection(nav[next][1], step > 0 ? 'next' : 'previous');
  }, [activeIndex, selectSection]);
  useSlideWheel(shellRef, contentRef, moveSlide);
  useSlideSwipe(shellRef, moveSlide);
  const summaryBreak = portfolio.summary.indexOf('. ') + 1;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div ref={shellRef} className={`site-shell mode-${mode}`}>
        <WeatherScene scene={weather.scene} paused={motionPaused} />
        <div className="view-controls">
          <IconButton className="view-control" onClick={() => setMotionPaused((value) => !value)} aria-label={motionPaused ? 'Play weather animation' : 'Pause weather animation'} title={motionPaused ? 'Play weather animation' : 'Pause weather animation'}>
            {motionPaused ? <PlayArrowRounded /> : <PauseRounded />}
          </IconButton>
          <IconButton className="view-control" onClick={() => setMode((value) => value === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            {mode === 'light' ? <DarkModeRounded /> : <LightModeRounded />}
          </IconButton>
        </div>

        <nav className="arc-navigation" aria-label="Portfolio sections" style={{ '--nav-count': nav.length } as CSSProperties}>
          {nav.map(([label, id, Icon], index) => {
            const slot = (index - activeIndex + nav.length + Math.floor(nav.length / 2)) % nav.length;
            const position = (slot + 0.5) / nav.length;
            return (
              <a key={id} href={`#${id}`} className={`arc-link${activeSection === id ? ' active' : ''}`}
                aria-current={activeSection === id ? 'page' : undefined}
                aria-label={label}
                style={{ '--nav-x': `${position * 100}%`, '--nav-y': `${(arcY(position * 1000) + 32) / 1.6}%` } as CSSProperties}
                onClick={(event) => { event.preventDefault(); selectSection(id); }}
                onKeyDown={(event) => {
                  let next = index;
                  if (event.key === 'ArrowRight') next = (index + 1) % nav.length;
                  else if (event.key === 'ArrowLeft') next = (index + nav.length - 1) % nav.length;
                  else if (event.key === 'Home') next = 0;
                  else if (event.key === 'End') next = nav.length - 1;
                  else return;
                  event.preventDefault();
                  selectSection(nav[next][1], event.key === 'ArrowLeft' ? 'previous' : event.key === 'ArrowRight' ? 'next' : undefined);
                  event.currentTarget.parentElement?.querySelector<HTMLAnchorElement>(`a[href="#${nav[next][1]}"]`)?.focus();
                }}>
                <Icon aria-hidden="true" /><span className={id === 'experience' ? 'nav-label-full' : undefined}>{label}</span>
                {id === 'experience' && <span className="nav-label-short" aria-hidden="true">Work</span>}
              </a>
            );
          })}
        </nav>

        <main className="content" aria-label="Portfolio slideshow">
          <div key={activeSection} ref={panelRef} className={`slide-panel glass-panel panel-${direction} panel-${panelMotion}`}>
            <div ref={contentRef} className={`slide-enter${activeSection === 'cv' ? ' cv-slide' : ''}`} tabIndex={0} role="region" aria-label="Slide content">
              {activeSection === 'home' && (
                <section id="home-slide" className="home-slide" aria-labelledby="home-title">
                  <div className="availability"><span /> Available for new opportunities</div>
                  <div className="hero-content">
                    <Avatar className="profile-mark" src="/john-mark-rosales.jpg" alt="John Mark Rosales at a waterfall" />
                    <div className="intro">
                      <Typography className="hello">Hello, I&apos;m</Typography>
                      <Typography id="home-title" component="h1">{portfolio.name}</Typography>
                      <Typography className="eyebrow">{portfolio.title}</Typography>
                      <Stack className="contact-details" gap={1.25}>
                        <span><LocationOnOutlined />{portfolio.location}</span>
                        <a href={`tel:${portfolio.phone}`}><PhoneOutlined />{portfolio.phone}</a>
                        <a href={`mailto:${portfolio.email}`}><EmailOutlined />{portfolio.email}</a>
                      </Stack>
                      <Button className="shine-button" component="a" href={`mailto:${portfolio.email}`} variant="contained" startIcon={<EmailOutlined />}>Get in touch</Button>
                    </div>
                  </div>
                  <Typography className="hero-statement">Building modern web experiences with clean code and thoughtful design.</Typography>
                </section>
              )}
              {activeSection === 'about' && (
                <Section id="about" title="Professional Summary" icon={<TerminalRounded />}>
                  <Typography className="summary-text">{portfolio.summary.slice(0, summaryBreak)}</Typography>
                  <Typography className="summary-text">{portfolio.summary.slice(summaryBreak + 1)}</Typography>
                </Section>
              )}
              {activeSection === 'experience' && (
                <Section id="experience" title="Professional Experience" icon={<WorkOutlineRounded />}>
                  <div className="experience-heading">
                    <div><Typography component="h2">{portfolio.experience.company}</Typography><Typography>{portfolio.experience.role}</Typography></div>
                    <Typography>{portfolio.experience.period}</Typography>
                  </div>
                  <div className="project-list">
                    {portfolio.projects.map((project) => <article key={project.name} className="project-row">
                      <Typography component="h3">{project.name}</Typography>
                      <Typography>{project.description}</Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.7} sx={{ mt: 1 }}>{project.technologies.map((item) => <Chip key={item} label={item} size="small" />)}</Stack>
                    </article>)}
                  </div>
                </Section>
              )}
              {activeSection === 'skills' && (
                <Section id="skills" title="Technical Skills" icon={<LayersRounded />}>
                  <div className="skills-grid">{portfolio.skills.map((group) => <div key={group.label}>
                    <Typography component="h2">{group.label}</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.85}>{group.items.map((item) => <SkillChip key={item} skill={item} />)}</Stack>
                  </div>)}</div>
                </Section>
              )}
              {activeSection === 'education' && (
                <Section id="education" title="Education" icon={<SchoolRounded />}>
                  <Typography component="h2" className="degree">{portfolio.education.degree}</Typography>
                  <Typography className="school">{portfolio.education.school}</Typography>
                  <Typography className="education-date">{portfolio.education.period}</Typography>
                </Section>
              )}
              {activeSection === 'cv' && (
                <Section id="cv" title="CV Summary" icon={<DescriptionOutlined />}><CvOverview /></Section>
              )}
              {activeSection === 'social' && (
                <Section id="social" title="Social Media" icon={<ShareOutlined />}><SocialLinks /></Section>
              )}
            </div>
            <footer className="slide-footer">
              <span className="weather-caption">{weather.label}</span>
              <div className="slide-controls">
                <button type="button" className="slide-button" aria-label="Previous slide" onClick={() => moveSlide(-1)}><ChevronLeftRounded aria-hidden="true" /><span>Previous</span></button>
                <span className="slide-counter" aria-label={`Slide ${activeIndex + 1} of ${nav.length}`} aria-live="polite">{String(activeIndex + 1).padStart(2, '0')} / {String(nav.length).padStart(2, '0')}</span>
                <button type="button" className="slide-button" aria-label="Next slide" onClick={() => moveSlide(1)}><span>Next</span><ChevronRightRounded aria-hidden="true" /></button>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
