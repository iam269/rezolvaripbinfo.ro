const searchForm = document.getElementById('searchForm');
const searchId = document.getElementById('searchId');
const homeContent = document.getElementById('homeContent');
const problemContent = document.getElementById('problemContent');

const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

// Theme toggle functionality
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
} else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
}

themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
});

searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    let id = searchId.value.trim();
    if (id === "unu") {
        id = "1";
    }
    if (id) {
        await showProblem(id);
    }
});

async function showProblem(id) {
    try {
        let response = await fetch(`problems/${id}.html`);
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const container = doc.querySelector('.container');
            if (!container) {
                throw new Error('Invalid problem format');
            }
            // Add copy button to pre tags
            let modifiedHTML = container.innerHTML.replace(/<pre>/g, '<div class="relative bg-blue-50 dark:bg-blue-900 p-4 rounded-md"><button class="copy-btn absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm">Copiază</button><pre class="pt-8">').replace(/<\/pre>/g, '</pre></div>');
            problemContent.innerHTML = `
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold mb-6">Problema #${id}</h2>
                    ${modifiedHTML}
                    <button id="backBtn" class="mt-8 bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90">Înapoi la căutare</button>
                </div>
            `;
        } else {
            // Try to fetch as code file
            response = await fetch(`problems/${id}`);
            if (!response.ok) {
                throw new Error('Problem not found');
            }
            const code = await response.text();
            problemContent.innerHTML = `
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold mb-6">Problema #${id}</h2>
                    <div class="space-y-6">
                        <h3 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">Soluție</h3>
                        <div class="relative bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
                            <button class="copy-btn absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm">Copiază</button>
                            <pre class="pt-8">${code}</pre>
                        </div>
                    </div>
                    <button id="backBtn" class="mt-8 bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90">Înapoi la căutare</button>
                </div>
            `;
        }
        homeContent.classList.add('hidden');
        problemContent.classList.remove('hidden');

        // Add back button event
        document.getElementById('backBtn').addEventListener('click', function() {
            homeContent.classList.remove('hidden');
            problemContent.classList.add('hidden');
            searchId.value = '';
        });

        // Add copy button events
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const pre = this.nextElementSibling;
                navigator.clipboard.writeText(pre.textContent).then(() => {
                    this.textContent = 'Copiat!';
                    setTimeout(() => this.textContent = 'Copiază', 2000);
                });
            });
        });
    } catch (error) {
        problemContent.innerHTML = `
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
                <h2 class="text-3xl font-bold mb-6">Problema #${id} - Nu a fost găsită</h2>
                <p class="text-gray-600 dark:text-gray-400 mb-8">Problema cu ID-ul ${id} nu există în baza noastră de date.</p>
                <button id="backBtn" class="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90">Înapoi la căutare</button>
            </div>
        `;
        homeContent.classList.add('hidden');
        problemContent.classList.remove('hidden');

        document.getElementById('backBtn').addEventListener('click', function() {
            homeContent.classList.remove('hidden');
            problemContent.classList.add('hidden');
            searchId.value = '';
        });
    }
}