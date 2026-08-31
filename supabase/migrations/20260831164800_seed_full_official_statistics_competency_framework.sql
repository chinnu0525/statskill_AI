insert into public.competency_domains(code,name,description)
values
  ('STAT','Statistical','Official statistics methods, subject-matter statistics, metadata and data quality.'),
  ('TECH','Technical','Programming, analytical tools, geospatial methods, AI/ML, cloud and open-data technologies.'),
  ('DIGITAL','Digital Governance','Cybersecurity, privacy, digital trust, government cloud and digital public infrastructure.'),
  ('BEHAVIOR','Behavioural & Managerial','Leadership, communication, project delivery, ethics, decision making and change management.')
on conflict (code) do update
set name = excluded.name,
    description = excluded.description;

with framework(domain_code, code, name, description) as (
  values
    ('STAT','STAT-SURVEY-DESIGN','Survey Design','Questionnaire design, survey planning, frames, modes and fieldwork design for official statistics.'),
    ('STAT','STAT-SAMPLING','Sampling','Probability sampling, sample design, weighting, estimation and sampling-error concepts.'),
    ('STAT','STAT-ANALYSIS','Statistical Analysis','Descriptive and inferential analysis for official statistical production.'),
    ('STAT','STAT-NATIONAL-ACCOUNTS','National Accounts','Concepts and compilation practices for national accounts and macroeconomic aggregates.'),
    ('STAT','STAT-PRICE','Price Statistics','Compilation and interpretation of consumer, wholesale and producer price statistics.'),
    ('STAT','STAT-LABOUR','Labour Statistics','Labour-force concepts, employment, unemployment and labour-market indicators.'),
    ('STAT','STAT-AGRICULTURE','Agriculture Statistics','Agricultural production, area, yield, livestock and related official statistics.'),
    ('STAT','STAT-INDUSTRIAL','Industrial Statistics','Industrial production, enterprise statistics and manufacturing indicators.'),
    ('STAT','STAT-SDG','SDG Statistics','Statistical indicators and monitoring approaches for the Sustainable Development Goals.'),
    ('STAT','STAT-METADATA','Statistical Metadata','Metadata standards, classifications, concepts, definitions and dissemination metadata.'),
    ('STAT','STAT-DATA-QUALITY','Data Quality','Quality frameworks, validation, coherence, accuracy, timeliness and quality assurance.'),

    ('TECH','TECH-PYTHON','Python for Statistics','Python programming for reproducible statistical, analytical and data-engineering workflows.'),
    ('TECH','TECH-R','R for Statistics','R programming for statistical analysis, visualization and reproducible workflows.'),
    ('TECH','TECH-SQL','SQL','Relational querying, data transformation and analytical SQL for statistical systems.'),
    ('TECH','TECH-STATA','Stata','Statistical data management and analysis using Stata.'),
    ('TECH','TECH-SPSS','SPSS','Statistical data management and analysis using SPSS.'),
    ('TECH','TECH-SAS','SAS','Statistical data management and analysis using SAS.'),
    ('TECH','TECH-GIS','GIS & Spatial Analysis','Geospatial data handling, mapping, spatial analysis and geostatistical workflows.'),
    ('TECH','TECH-DATAVIZ','Data Visualization','Clear, accessible and decision-oriented visualization of official statistics.'),
    ('TECH','TECH-AIML','AI & Machine Learning','AI/ML foundations and responsible application to statistical and data workflows.'),
    ('TECH','TECH-CLOUD','Cloud Computing','Cloud-native data, analytics, storage and compute concepts for government workloads.'),
    ('TECH','TECH-APIS','APIs','API design, consumption and interoperability for statistical data services.'),
    ('TECH','TECH-OPEN-DATA','Open Data','Open-data standards, machine-readable dissemination, licensing and reuse.'),

    ('DIGITAL','DIG-DATA','Data Management & Governance','Data stewardship, lifecycle management, governance controls and responsible data handling.'),
    ('DIGITAL','DIG-CYBER','Cybersecurity','Secure digital practices, access control, threat awareness and incident-response fundamentals.'),
    ('DIGITAL','DIG-PRIVACY','Data Privacy','Privacy principles, lawful processing, minimization, disclosure control and protection of sensitive data.'),
    ('DIGITAL','DIG-SIGNATURES','Digital Signatures','Digital-signature concepts, trust, certificates and secure government transactions.'),
    ('DIGITAL','DIG-GOV-CLOUD','Government Cloud','Government cloud architecture, deployment models, security and service governance.'),
    ('DIGITAL','DIG-DPI','Digital Public Infrastructure','Interoperable digital public infrastructure, identity, payments and trusted data exchange concepts.'),

    ('BEHAVIOR','BEH-LEADERSHIP','Leadership','Leading teams, setting direction, accountability and people development.'),
    ('BEHAVIOR','BEH-COMMUNICATION','Communication','Clear written, verbal and stakeholder communication for evidence-based public administration.'),
    ('BEHAVIOR','BEH-PROJECT-MGMT','Project Management','Planning, delivery, risk, resources, milestones and outcomes for statistical programmes.'),
    ('BEHAVIOR','BEH-ETHICS','Ethics','Public-service ethics, statistical integrity, impartiality, confidentiality and professional conduct.'),
    ('BEHAVIOR','BEH-DECISION','Decision Making','Structured, evidence-based judgment and decision making under uncertainty.'),
    ('BEHAVIOR','BEH-CHANGE','Change Management','Managing adoption, organizational change, capability transitions and continuous improvement.')
)
insert into public.competencies(domain_id,code,name,description)
select d.id, f.code, f.name, f.description
from framework f
join public.competency_domains d on d.code = f.domain_code
on conflict (code) do update
set domain_id = excluded.domain_id,
    name = excluded.name,
    description = excluded.description;
