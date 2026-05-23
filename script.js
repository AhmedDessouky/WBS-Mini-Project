const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const projectsData = [
  { title: 'RISC-V FPGA Implementation', type: 'hardware', description: 'Pipelined RISC-V processor on Nexys A7 FPGA supporting the RV32I instruction set. It demonstrates digital design, processor architecture, and FPGA implementation knowledge.' },
  { title: 'Shooter Game', type: 'software', description: 'Third-person shooter game built in C++ using Qt Creator for graphics and interactive gameplay logic.' },
  { title: 'Video Game Database System', type: 'software', description: 'MySQL relational database with a GUI for video game data analytics, searching, filtering, and structured reporting.' },
  { title: 'Search Engine', type: 'software', description: 'Webpage filtering and ranking system using relevance scoring to organize and return more useful search results.' },
  { title: 'Distributed Systems Platform', type: 'software', description: 'Instagram-like social media platform using data distribution concepts from distributed systems.' },
  { title: 'Digital Forensics Investigation', type: 'software', description: 'Structured forensic analysis project applying data recovery techniques and evidence investigation steps.' },
  { title: 'Machine Learning Model', type: 'ai', description: 'Data analysis and prediction model with preprocessing, model evaluation, and interpretation of results.' },
  { title: 'Encryption Research', type: 'software', description: 'Research project studying encryption methods, security concepts, and their practical applications.' },
  { title: 'Thesis - Smart Planting', type: 'ai', description: 'IoT-based smart agriculture system with AI-powered plant health monitoring, sensor readings, and automation support for farmers.' }
];

const menuBtn = $('#menuBtn');
const navLinks = $('#navLinks');
const themeToggle = $('#themeToggle');
const aboutToggle = $('#aboutToggle');
const shortAbout = $('#shortAbout');
const longAbout = $('#longAbout');
const projectGrid = $('#projectGrid');
const projectSearch = $('#projectSearch');
const projectCount = $('#projectCount');
const filters = $$('.filter');
const contactForm = $('#contactForm');
const formMessage = $('#formMessage');
const repoGrid = $('#repoGrid');
const repoStatus = $('#repoStatus');
const loadRepos = $('#loadRepos');
const clearRepos = $('#clearRepos');
const githubUser = $('#githubUser');
const progressBar = $('#progressBar');
const dialog = $('#projectDialog');
const dialogClose = $('#dialogClose');
const dialogTitle = $('#dialogTitle');
const dialogType = $('#dialogType');
const dialogDescription = $('#dialogDescription');
let activeFilter = 'all';

$('#year').textContent = new Date().getFullYear();

function applyStoredTheme() {
  const savedTheme = localStorage.getItem('portfolioTheme');
  if (savedTheme === 'dark') document.body.classList.add('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
}
applyStoredTheme();

menuBtn.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(isOpen));
});

$$('.nav-links a').forEach((link) => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('portfolioTheme', document.body.classList.contains('dark') ? 'dark' : 'light');
  themeToggle.textContent = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
});

aboutToggle.addEventListener('click', () => {
  const showingShort = shortAbout.classList.toggle('hidden') === false;
  longAbout.classList.toggle('hidden', showingShort);
  aboutToggle.textContent = showingShort ? 'Show full version' : 'Show shorter version';
});

function renderProjects() {
  const query = projectSearch.value.toLowerCase().trim();
  const visibleProjects = projectsData.filter((project) => {
    const matchesFilter = activeFilter === 'all' || project.type === activeFilter;
    const searchable = `${project.title} ${project.description} ${project.type}`.toLowerCase();
    return matchesFilter && searchable.includes(query);
  });
  projectGrid.innerHTML = '';
  visibleProjects.forEach((project) => {
    const card = document.createElement('article');
    card.className = `project-card ${project.title.includes('Smart Planting') ? 'featured' : ''}`;
    card.tabIndex = 0;
    card.innerHTML = `<p class="eyebrow">${project.type}</p><h3>${project.title}</h3><p>${project.description}</p>`;
    card.addEventListener('click', () => openProject(project));
    card.addEventListener('keydown', (event) => { if (event.key === 'Enter') openProject(project); });
    projectGrid.appendChild(card);
  });
  projectCount.textContent = `${visibleProjects.length} project${visibleProjects.length === 1 ? '' : 's'} shown`;
}

function openProject(project) {
  dialogType.textContent = project.type;
  dialogTitle.textContent = project.title;
  dialogDescription.textContent = project.description;
  if (typeof dialog.showModal === 'function') dialog.showModal();
}

dialogClose.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    renderProjects();
  });
});
projectSearch.addEventListener('input', renderProjects);
renderProjects();

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const topic = $('#topic').value;
  const reply = document.querySelector('input[name="reply"]:checked').value;
  const consent = $('#consent').checked;
  const message = $('#message').value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name.length < 2) return showFormMessage('Please enter a valid name.', false);
  if (!emailPattern.test(email)) return showFormMessage('Please enter a valid email address.', false);
  if (!topic) return showFormMessage('Please choose a topic.', false);
  if (!consent) return showFormMessage('Please confirm the checkbox before sending.', false);
  if (message.length < 10) return showFormMessage('Please write a message of at least 10 characters.', false);

  const subject = encodeURIComponent(`Portfolio Contact - ${topic}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPreferred Reply: ${reply}\n\nMessage:\n${message}`);
  showFormMessage(`Thank you, ${name}. Your email app should open now.`, true);
  window.location.href = `mailto:adessouky@aucegypt.edu?subject=${subject}&body=${body}`;
  contactForm.reset();
});

function showFormMessage(message, success) {
  formMessage.textContent = message;
  formMessage.style.color = success ? 'var(--blue)' : '#dc2626';
}

async function fetchRepos() {
  const user = githubUser.value.trim() || 'ahmed3103';
  repoGrid.innerHTML = '';
  repoStatus.textContent = 'Loading repositories from GitHub API...';
  loadRepos.disabled = true;
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=6`);
    if (!response.ok) throw new Error(`GitHub returned status ${response.status}`);
    const repos = await response.json();
    if (!Array.isArray(repos) || repos.length === 0) {
      repoStatus.textContent = 'No public repositories were found for this username.';
      return;
    }
    repoStatus.textContent = `Showing ${repos.length} public repositories for ${user}.`;
    repos.forEach((repo) => {
      const card = document.createElement('article');
      card.className = 'repo-card';
      card.innerHTML = `<a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a><p>${repo.description || 'No description provided.'}</p><small>Language: ${repo.language || 'Not specified'} • Stars: ${repo.stargazers_count} • Forks: ${repo.forks_count}</small>`;
      repoGrid.appendChild(card);
    });
  } catch (error) {
    repoStatus.textContent = `Could not load GitHub data. ${error.message}. Try again later or check the username.`;
  } finally {
    loadRepos.disabled = false;
  }
}

loadRepos.addEventListener('click', fetchRepos);
githubUser.addEventListener('keydown', (event) => { if (event.key === 'Enter') fetchRepos(); });
clearRepos.addEventListener('click', () => { repoGrid.innerHTML = ''; repoStatus.textContent = 'Repository results cleared.'; });

window.addEventListener('scroll', () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.12 });
$$('.reveal').forEach((section) => observer.observe(section));
