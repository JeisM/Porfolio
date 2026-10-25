import { portfolio } from './portfolio';
import { Avatar } from '@mui/material';
import { SkillChip } from './SkillChip';

function Profile() {
  return <header className="cv-profile">
    <div className="cv-identity">
      <Avatar className="cv-avatar profile-mark" src="/john-mark-rosales.jpg" alt="John Mark Rosales at a waterfall" />
      <div><h2>{portfolio.name}</h2><p>{portfolio.title}</p></div>
    </div>
    <address><span>{portfolio.location}</span><a href={`tel:${portfolio.phone}`}>{portfolio.phone}</a><a href={`mailto:${portfolio.email}`}>{portfolio.email}</a></address>
  </header>;
}

function Summary() {
  return <article className="cv-summary"><h2>Professional Summary</h2><p>{portfolio.summary}</p></article>;
}

function Employer() {
  return <><h2>Professional Experience</h2><div className="cv-employer"><strong>{portfolio.experience.company}</strong><span>{portfolio.experience.period}</span></div><p>{portfolio.experience.role}</p></>;
}

function Project({ project }: { project: typeof portfolio.projects[number] }) {
  return <div className="cv-project"><h3>{project.name}</h3><p>{project.description}</p><p className="cv-technologies">{project.technologies.join(' · ')}</p></div>;
}

function SkillGroup({ group }: { group: typeof portfolio.skills[number] }) {
  return <div><h3>{group.label}</h3><div className="cv-skill-list">{group.items.map((skill) => <SkillChip key={skill} skill={skill} />)}</div></div>;
}

function Education() {
  return <article className="cv-education"><h2>Education</h2><h3>{portfolio.education.degree}</h3><p>{portfolio.education.school}</p><p>{portfolio.education.period}</p></article>;
}

export function CvOverview() {
  return (
    <div className="cv-overview cv-complete">
      <Profile />
      <Summary />
      <div className="cv-columns">
        <article className="cv-experience"><Employer />{portfolio.projects.map((project) => <Project key={project.name} project={project} />)}</article>
        <div className="cv-sidebar">
          <article className="cv-skills"><h2>Technical Skills</h2>{portfolio.skills.map((group) => <SkillGroup key={group.label} group={group} />)}</article>
          <Education />
        </div>
      </div>
    </div>
  );
}
