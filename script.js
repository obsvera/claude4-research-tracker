// Research Paper Tracker - JavaScript
// Global variables - store data in JavaScript memory
let papers = [];
let nextId = 1;

// Summary function
function showSummary() {
    console.log('showSummary called, papers length:', papers.length);
    
    const summaryContainer = document.getElementById('papersSummary');
    
    if (!summaryContainer) {
        console.error('Summary container not found!');
        return;
    }
    
    if (papers.length === 0) {
        summaryContainer.innerHTML = '<div style="grid-column: 1 / -1; display: flex; justify-content: center; align-items: center; color: #888; font-style: italic; padding: 40px; min-height: 100px;">No papers added yet. Add some papers to see them here!</div>';
        return;
    }
    
    // Generate summary cards
    let summaryHTML = '';
    papers.forEach(paper => {
        const keywords = paper.keywords ? paper.keywords.split(',').map(k => k.trim()).filter(k => k) : [];
        const keywordTags = keywords.map(keyword => 
            `<span class="keyword-tag">${keyword}</span>`
        ).join('');
        
        const stars = paper.rating ? '★'.repeat(parseInt(paper.rating)) : '';
        const paperUrl = paper.doi || '#';
        
        summaryHTML += `
            <div class="paper-card">
                <div class="paper-status-info">
                    <span class="status-badge">${(paper.status || 'to-read').replace('-', ' ')}</span>
                    <div>
                        <span class="priority-badge">${paper.priority || 'medium'}</span>
                        ${stars ? `<span class="rating-stars">${stars}</span>` : ''}
                    </div>
                </div>
                
                <div class="paper-title" ${paperUrl !== '#' ? `onclick="window.open('${paperUrl}', '_blank')"` : ''} title="Click to open paper">
                    ${paper.title || 'Untitled Paper'}
                </div>
                
                ${paper.authors ? `<div class="paper-authors">${paper.authors}</div>` : ''}
                
                <div class="paper-year-journal">
                    ${paper.year ? paper.year : 'Year not specified'}
                    ${paper.journal ? ` • ${paper.journal}` : ''}
                </div>
                
                ${keywordTags ? `<div class="paper-keywords">${keywordTags}</div>` : ''}
                
                ${paper.keyPoints ? `<div class="paper-key-points" style="margin: 12px 0; padding: 10px; background: #f8f9fa; border-left: 3px solid #4a90e2; border-radius: 4px;">
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Key Points:</div>
                    <div style="font-size: 13px; line-height: 1.4; color: #555;">${paper.keyPoints}</div>
                </div>` : ''}
                
                ${paper.notes ? `<div class="paper-relevance" style="margin: 12px 0; padding: 10px; background: #fff8e1; border-left: 3px solid #ffa726; border-radius: 4px;">
                    <div style="font-weight: 600; color: #e65100; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Relevance & Notes:</div>
                    <div style="font-size: 13px; line-height: 1.4; color: #555;">${paper.notes}</div>
                </div>` : ''}
                
                ${paperUrl !== '#' ? `<a href="${paperUrl}" target="_blank" class="paper-link">📖 Open Paper</a>` : ''}
            </div>
        `;
    });
    
    summaryContainer.innerHTML = summaryHTML;
    console.log('Summary updated successfully');
}

// Paper management functions
function addRow() {
    const newPaper = {
        id: nextId++,
        title: "",
        authors: "",
        year: "",
        journal: "",
        keywords: "",
        status: "to-read",
        priority: "medium",
        rating: "",
        dateAdded: new Date().toISOString().split('T')[0],
        keyPoints: "",
        notes: "",
        citation: "",
        doi: "",
        chapter: ""
    };
    papers.push(newPaper);
    renderTable();
    updateStats();
    showSummary();
}

function deleteRow(id) {
    console.log('Delete called for paper ID:', id);
    
    const paperToDelete = papers.find(p => p.id === id);
    const paperTitle = paperToDelete ? paperToDelete.title : 'Unknown paper';
    
    console.log(`Deleting paper: "${paperTitle}"`);
    const originalLength = papers.length;
    
    papers = papers.filter(paper => paper.id !== id);
    
    console.log(`✅ Paper deleted! Array length: ${originalLength} -> ${papers.length}`);
    
    renderTable();
    updateStats();
    showSummary();
    console.log('Delete operation completed successfully');
}

function clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        papers = [];
        nextId = 1;
        renderTable();
        updateStats();
        showSummary();
    }
}

function updatePaper(id, field, value) {
    const paper = papers.find(p => p.id === id);
    if (paper) {
        paper[field] = value;
        
        // Auto-format citation when key fields are updated
        if (['title', 'authors', 'year', 'journal'].includes(field)) {
            const formattedCitation = formatAPA7Citation(paper);
            if (formattedCitation) {
                paper.citation = formattedCitation;
                const citationTextarea = document.querySelector(`textarea[onchange*="'citation'"][onchange*="${id}"]`);
                if (citationTextarea) {
                    citationTextarea.value = formattedCitation;
                }
            }
        }
        
        updateStats();
        setTimeout(() => updateRowStyling(id), 0);
        showSummary();
    }
}

function updateRowStyling(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        const paper = papers.find(p => p.id === id);
        row.className = `status-${paper.status} priority-${paper.priority}`;
    }
}

function formatAPA7Citation(paper) {
    if (!paper.authors || !paper.title) {
        return "";
    }
    
    let authors = paper.authors.trim();
    if (authors) {
        authors = authors.replace(/\s*&\s*/g, ', & ');
        authors = authors.replace(/,\s*,/g, ',');
        authors = authors.replace(/,\s*&\s*([^,]+)$/, ', & $1');
    }
    
    const year = paper.year ? `(${paper.year})` : "(n.d.)";
    const title = paper.title.trim();
    const journal = paper.journal ? paper.journal.trim() : "";
    
    if (journal) {
        if (journal.toLowerCase().includes('arxiv')) {
            const arxivMatch = paper.doi ? paper.doi.match(/arxiv\.org\/abs\/([0-9]+\.[0-9]+)/) : null;
            const arxivId = arxivMatch ? arxivMatch[1] : "";
            return `${authors} ${year}. ${title}. *arXiv preprint*${arxivId ? ` arXiv:${arxivId}` : ""}. ${paper.doi || ""}`;
        } else {
            return `${authors} ${year}. ${title}. *${journal}*${paper.volume ? `, ${paper.volume}` : ""}${paper.issue ? `(${paper.issue})` : ""}${paper.pages ? `, ${paper.pages}` : ""}. ${paper.doi || ""}`;
        }
    } else {
        return `${authors} ${year}. ${title}. ${paper.doi || ""}`;
    }
}

function renderTable() {
    const tbody = document.getElementById('paperTableBody');
    tbody.innerHTML = '';

    papers.forEach(paper => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', paper.id);
        row.className = `status-${paper.status} priority-${paper.priority}`;
        
        row.innerHTML = `
            <td>
                <button onclick="deleteRow(${paper.id})" style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; white-space: nowrap;">Delete</button>
            </td>
            <td><input type="text" value="${paper.title}" onchange="updatePaper(${paper.id}, 'title', this.value)" placeholder="Paper title"></td>
            <td><input type="text" value="${paper.authors}" onchange="updatePaper(${paper.id}, 'authors', this.value)" placeholder="Author names"></td>
            <td><input type="number" value="${paper.year}" onchange="updatePaper(${paper.id}, 'year', this.value)" placeholder="2023" min="1900" max="2030"></td>
            <td><input type="text" value="${paper.journal}" onchange="updatePaper(${paper.id}, 'journal', this.value)" placeholder="Journal name"></td>
            <td><input type="text" value="${paper.keywords}" onchange="updatePaper(${paper.id}, 'keywords', this.value)" placeholder="keyword1, keyword2"></td>
            <td>
                <select onchange="updatePaper(${paper.id}, 'status', this.value)">
                    <option value="to-read" ${paper.status === 'to-read' ? 'selected' : ''}>To Read</option>
                    <option value="reading" ${paper.status === 'reading' ? 'selected' : ''}>Reading</option>
                    <option value="read" ${paper.status === 'read' ? 'selected' : ''}>Read</option>
                    <option value="skimmed" ${paper.status === 'skimmed' ? 'selected' : ''}>Skimmed</option>
                </select>
            </td>
            <td>
                <select onchange="updatePaper(${paper.id}, 'priority', this.value)">
                    <option value="low" ${paper.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${paper.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${paper.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
            </td>
            <td>
                <select onchange="updatePaper(${paper.id}, 'rating', this.value)">
                    <option value="">-</option>
                    <option value="1" ${paper.rating === '1' ? 'selected' : ''}>1⭐</option>
                    <option value="2" ${paper.rating === '2' ? 'selected' : ''}>2⭐</option>
                    <option value="3" ${paper.rating === '3' ? 'selected' : ''}>3⭐</option>
                    <option value="4" ${paper.rating === '4' ? 'selected' : ''}>4⭐</option>
                    <option value="5" ${paper.rating === '5' ? 'selected' : ''}>5⭐</option>
                </select>
            </td>
            <td><input type="date" value="${paper.dateAdded}" onchange="updatePaper(${paper.id}, 'dateAdded', this.value)"></td>
            <td><textarea onchange="updatePaper(${paper.id}, 'keyPoints', this.value)" placeholder="Main findings, methodology, key insights...">${paper.keyPoints}</textarea></td>
            <td><textarea onchange="updatePaper(${paper.id}, 'notes', this.value)" placeholder="Relevance to dissertation, connections to other work, critical analysis...">${paper.notes}</textarea></td>
            <td><textarea onchange="updatePaper(${paper.id}, 'citation', this.value)" placeholder="APA 7th edition citation (auto-generated when title/authors/year/journal are filled)">${paper.citation}</textarea></td>
            <td><input type="url" value="${paper.doi}" onchange="updatePaper(${paper.id}, 'doi', this.value)" placeholder="DOI or URL"></td>
            <td><input type="text" value="${paper.chapter}" onchange="updatePaper(${paper.id}, 'chapter', this.value)" placeholder="Chapter 1, Literature Review, etc."></td>
        `;
        
        tbody.appendChild(row);
    });
    
    showSummary();
}

// Smart input processing function
async function addFromSmartInput() {
    const input = document.getElementById('extractedData').value.trim();
    if (!input) {
        alert('Please enter a paper title, URL, DOI, or citation information!');
        return;
    }

    // Check if input is already valid JSON
    try {
        const paperInfo = JSON.parse(input);
        showPreviewModal(paperInfo);
        return;
    } catch (e) {
        // Not JSON, show Claude prompt
        showClaudePrompt(input);
    }
}

// Show Claude prompt for user to copy
function showClaudePrompt(input) {
    const prompt = `I'm using a Research Paper Tracker app and need you to extract paper information. The user provided: "${input}"

Please analyze this and return the information in this exact JSON format:

{
  "title": "Full paper title",
  "authors": "Author names in APA format (Last, F. M., Last, F. M., & Last, F. M.)",
  "year": "Publication year",
  "journal": "Journal or venue name",
  "keywords": "keyword1, keyword2, keyword3, keyword4",
  "abstract": "Key findings, methodology, and main contributions in 2-3 sentences",
  "url": "DOI link or paper URL",
  "relevance": "Why this paper might be relevant to research (1-2 sentences)"
}

Please ensure the JSON is properly formatted and fill in as much information as possible. If you cannot find certain fields, use empty strings but keep the JSON structure intact.`;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">📋 Copy This Prompt to Claude</h3>
                <button class="modal-close" onclick="closeClaudePromptModal()">&times;</button>
            </div>
            <div class="modal-content">
                <p style="margin-bottom: 16px; color: #666; font-size: 14px;">
                    Copy the prompt below, paste it into your Claude chat, then copy the JSON response back into the input field.
                </p>
                <div class="modal-field">
                    <textarea id="claude-prompt" readonly style="min-height: 300px; font-family: monospace; font-size: 13px; background: #f8f9fa;">${prompt}</textarea>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-secondary" onclick="closeClaudePromptModal()">Close</button>
                <button class="modal-btn modal-btn-primary" onclick="copyClaudePrompt()">📋 Copy Prompt</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus and select the textarea
    setTimeout(() => {
        const textarea = document.getElementById('claude-prompt');
        textarea.focus();
        textarea.select();
    }, 100);
}

// Close Claude prompt modal
function closeClaudePromptModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Copy Claude prompt to clipboard
function copyClaudePrompt() {
    const textarea = document.getElementById('claude-prompt');
    textarea.select();
    document.execCommand('copy');
    
    // Show feedback
    const button = document.querySelector('.modal-btn-primary');
    const originalText = button.innerHTML;
    button.innerHTML = '✅ Copied!';
    button.style.background = '#28a745';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '#4a90e2';
    }, 2000);
}

// Detect what type of input the user provided
function detectInputType(input) {
    // Check for URLs
    if (input.match(/^https?:\/\//i) || input.includes('arxiv.org') || input.includes('doi.org')) {
        return 'url';
    }
    
    // Check for DOI pattern
    if (input.match(/^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/)) {
        return 'doi';
    }
    
    // Check if it looks like a formatted citation
    if (input.includes('et al.') || input.match(/\(\d{4}\)/)) {
        return 'citation';
    }
    
    // Default to title/general text
    return 'title';
}

// Extract information from URL or DOI
async function extractFromUrlOrDoi(input) {
    // This is a placeholder - in a real implementation, you might:
    // 1. Try to fetch the page and parse metadata
    // 2. Use CrossRef API for DOIs
    // 3. Check arXiv API for arXiv papers
    
    // For now, we'll simulate a basic check and then fall back to Claude
    if (input.includes('example.com') || input.includes('broken-link')) {
        throw new Error('URL not accessible');
    }
    
    // If URL seems valid, extract with Claude but include the URL
    return await extractWithClaude(input);
}

// Extract information using Claude
async function extractWithClaude(input) {
    const prompt = `I'm using a Research Paper Tracker app and need you to extract paper information. The user provided: "${input}"

Please analyze this and return the information in this exact JSON format:

{
  "title": "Full paper title",
  "authors": "Author names in APA format (Last, F. M., Last, F. M., & Last, F. M.)",
  "year": "Publication year",
  "journal": "Journal or venue name",
  "keywords": "keyword1, keyword2, keyword3, keyword4",
  "abstract": "Key findings, methodology, and main contributions in 2-3 sentences",
  "url": "DOI link or paper URL",
  "relevance": "Why this paper might be relevant to research (1-2 sentences)"
}

Please ensure the JSON is properly formatted and fill in as much information as possible. If you cannot find certain fields, use empty strings but keep the JSON structure intact.`;

    // Simulate Claude API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    try {
        // This is a placeholder for the actual Claude API integration
        // In a real implementation, this would make an actual API call
        const response = await simulateClaudeResponse(input);
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out after 20 seconds');
        }
        throw error;
    }
}

// Simulate Claude response (placeholder function)
async function simulateClaudeResponse(input) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, parse and extract information from the input
    const lowerInput = input.toLowerCase();
    
    // Try to extract information from various input formats
    let extractedInfo = {
        title: "",
        authors: "",
        year: "",
        journal: "",
        keywords: "",
        abstract: "",
        url: "",
        relevance: ""
    };
    
    // Handle specific known papers
    if (lowerInput.includes('attention') && lowerInput.includes('need') || input.includes('1706.03762')) {
        return {
            title: "Attention Is All You Need",
            authors: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I.",
            year: "2017",
            journal: "Advances in Neural Information Processing Systems",
            keywords: "transformer, attention mechanism, neural networks, deep learning",
            abstract: "Introduced the Transformer architecture that revolutionized NLP by relying entirely on attention mechanisms, eliminating recurrence and convolutions.",
            url: "https://arxiv.org/abs/1706.03762",
            relevance: "Seminal paper for understanding modern language models and transformer architectures."
        };
    }
    
    // Try to parse citation-like input
    const yearMatch = input.match(/\((\d{4})\)|\b(\d{4})\b/);
    if (yearMatch) {
        extractedInfo.year = yearMatch[1] || yearMatch[2];
    }
    
    // Extract potential journal information
    const journalPatterns = [
        /Academy of Management/i,
        /Management Review/i,
        /Strategic Management/i,
        /Nature/i,
        /Science/i,
        /Journal of/i,
        /Proceedings of/i
    ];
    
    for (const pattern of journalPatterns) {
        const match = input.match(pattern);
        if (match) {
            extractedInfo.journal = match[0];
            break;
        }
    }
    
    // Try to extract title (remove journal info if found)
    let cleanTitle = input;
    if (extractedInfo.journal) {
        cleanTitle = input.replace(new RegExp(extractedInfo.journal, 'gi'), '').trim();
    }
    
    // Clean up title by removing year, volume, issue info
    cleanTitle = cleanTitle.replace(/\(\d{4}\)/g, '').replace(/\b\d{4}\b/, '');
    cleanTitle = cleanTitle.replace(/Vol\.\s*\d+/gi, '').replace(/No\.\s*\d+/gi, '');
    cleanTitle = cleanTitle.replace(/,\s*$/, '').trim();
    
    if (cleanTitle && cleanTitle.length > 3) {
        extractedInfo.title = cleanTitle;
    } else {
        extractedInfo.title = input.substring(0, 100); // Fallback
    }
    
    // Generate some basic keywords based on the input
    const commonKeywords = {
        'management': ['management', 'leadership', 'organization'],
        'strategy': ['strategy', 'competitive advantage', 'business model'],
        'technology': ['technology', 'innovation', 'digital transformation'],
        'learning': ['machine learning', 'artificial intelligence', 'data science'],
        'neural': ['neural networks', 'deep learning', 'AI'],
        'social': ['social networks', 'sociology', 'social science']
    };
    
    let suggestedKeywords = [];
    for (const [key, keywords] of Object.entries(commonKeywords)) {
        if (lowerInput.includes(key)) {
            suggestedKeywords = suggestedKeywords.concat(keywords);
            break;
        }
    }
    
    if (suggestedKeywords.length === 0) {
        suggestedKeywords = ['research', 'academic study', 'analysis'];
    }
    
    extractedInfo.keywords = suggestedKeywords.slice(0, 4).join(', ');
    
    // Add a generic relevance note
    extractedInfo.relevance = "This paper may be relevant to your research area. Please review and update the relevance notes as needed.";
    
    // If it looks like a URL, preserve it
    if (input.match(/^https?:\/\//)) {
        extractedInfo.url = input;
    }
    
    return extractedInfo;
}

// Show preview modal with extracted information
function showPreviewModal(paperInfo) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">✅ Paper Information Found</h3>
                <button class="modal-close" onclick="closePreviewModal()">&times;</button>
            </div>
            <div class="modal-content">
                <div class="modal-field">
                    <label>Title</label>
                    <input type="text" id="preview-title" value="${paperInfo.title || ''}">
                </div>
                <div class="modal-field">
                    <label>Authors</label>
                    <input type="text" id="preview-authors" value="${paperInfo.authors || ''}">
                </div>
                <div class="modal-field">
                    <label>Year</label>
                    <input type="text" id="preview-year" value="${paperInfo.year || ''}">
                </div>
                <div class="modal-field">
                    <label>Journal/Venue</label>
                    <input type="text" id="preview-journal" value="${paperInfo.journal || ''}">
                </div>
                <div class="modal-field">
                    <label>Keywords</label>
                    <input type="text" id="preview-keywords" value="${paperInfo.keywords || ''}">
                </div>
                <div class="modal-field">
                    <label>Key Points/Abstract</label>
                    <textarea id="preview-abstract">${paperInfo.abstract || ''}</textarea>
                </div>
                <div class="modal-field">
                    <label>DOI/URL</label>
                    <input type="text" id="preview-url" value="${paperInfo.url || ''}">
                </div>
                <div class="modal-field">
                    <label>Relevance/Notes</label>
                    <textarea id="preview-relevance">${paperInfo.relevance || ''}</textarea>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-secondary" onclick="closePreviewModal()">Cancel</button>
                <button class="modal-btn modal-btn-primary" onclick="addPaperFromPreview()">Add to Library</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus first input
    setTimeout(() => {
        document.getElementById('preview-title').focus();
    }, 100);
}

// Close preview modal
function closePreviewModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Add paper from preview modal
function addPaperFromPreview() {
    const newPaper = {
        id: nextId++,
        title: document.getElementById('preview-title').value || '',
        authors: document.getElementById('preview-authors').value || '',
        year: document.getElementById('preview-year').value || '',
        journal: document.getElementById('preview-journal').value || '',
        keywords: document.getElementById('preview-keywords').value || '',
        status: "to-read",
        priority: "medium",
        rating: "",
        dateAdded: new Date().toISOString().split('T')[0],
        keyPoints: document.getElementById('preview-abstract').value || '',
        notes: document.getElementById('preview-relevance').value || '',
        citation: "",
        doi: document.getElementById('preview-url').value || '',
        chapter: ""
    };
    
    // Auto-generate citation
    const apaCitation = formatAPA7Citation(newPaper);
    if (apaCitation) {
        newPaper.citation = apaCitation;
    }
    
    papers.push(newPaper);
    renderTable();
    updateStats();
    showSummary();
    
    // Clear input and close modal
    document.getElementById('extractedData').value = '';
    closePreviewModal();
    
    alert('✅ Paper added successfully to your library!');
}

function updateStats() {
    const total = papers.length;
    const read = papers.filter(p => p.status === 'read').length;
    const reading = papers.filter(p => p.status === 'reading').length;
    const toRead = papers.filter(p => p.status === 'to-read').length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('readCount').textContent = read;
    document.getElementById('readingCount').textContent = reading;
    document.getElementById('toReadCount').textContent = toRead;
}

function exportToCSV() {
    const headers = ['Title', 'Authors', 'Year', 'Journal/Venue', 'Keywords', 'Status', 'Priority', 'Rating', 'Date Added', 'Key Points', 'Notes', 'Citation', 'DOI/URL', 'Chapter/Topic'];
    
    const csvContent = [
        headers.join(','),
        ...papers.map(paper => [
            `"${(paper.title || '').replace(/"/g, '""')}"`,
            `"${(paper.authors || '').replace(/"/g, '""')}"`,
            paper.year || '',
            `"${(paper.journal || '').replace(/"/g, '""')}"`,
            `"${(paper.keywords || '').replace(/"/g, '""')}"`,
            paper.status || '',
            paper.priority || '',
            paper.rating || '',
            paper.dateAdded || '',
            `"${(paper.keyPoints || '').replace(/"/g, '""')}"`,
            `"${(paper.notes || '').replace(/"/g, '""')}"`,
            `"${(paper.citation || '').replace(/"/g, '""')}"`,
            `"${(paper.doi || '').replace(/"/g, '""')}"`,
            `"${(paper.chapter || '').replace(/"/g, '""')}"`,
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dissertation_papers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importCSV(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csv = e.target.result;
            const lines = csv.split('\n');
            
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
                    const paper = {
                        id: nextId++,
                        title: values[0] ? values[0].replace(/"/g, '') : '',
                        authors: values[1] ? values[1].replace(/"/g, '') : '',
                        year: values[2] ? values[2].replace(/"/g, '') : '',
                        journal: values[3] ? values[3].replace(/"/g, '') : '',
                        keywords: values[4] ? values[4].replace(/"/g, '') : '',
                        status: values[5] ? values[5].replace(/"/g, '') : 'to-read',
                        priority: values[6] ? values[6].replace(/"/g, '') : 'medium',
                        rating: values[7] ? values[7].replace(/"/g, '') : '',
                        dateAdded: values[8] ? values[8].replace(/"/g, '') : new Date().toISOString().split('T')[0],
                        keyPoints: values[9] ? values[9].replace(/"/g, '') : '',
                        notes: values[10] ? values[10].replace(/"/g, '') : '',
                        citation: values[11] ? values[11].replace(/"/g, '') : '',
                        doi: values[12] ? values[12].replace(/"/g, '') : '',
                        chapter: values[13] ? values[13].replace(/"/g, '') : ''
                    };
                    papers.push(paper);
                }
            }
            renderTable();
            updateStats();
            showSummary();
        };
        reader.readAsText(file);
    }
}

// Initialize with sample data (optional)
function initSampleData() {
    const samplePaper = {
        id: nextId++,
        title: "Attention Is All You Need",
        authors: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I.",
        year: "2017",
        journal: "Advances in Neural Information Processing Systems",
        keywords: "transformer, attention mechanism, neural networks, deep learning",
        status: "read",
        priority: "high", 
        rating: "5",
        dateAdded: new Date().toISOString().split('T')[0],
        keyPoints: "Introduced the Transformer architecture that revolutionized NLP by relying entirely on attention mechanisms, eliminating recurrence and convolutions",
        notes: "Seminal paper for understanding modern language models - highly relevant to Chapter 2. This architecture became the foundation for GPT, BERT, and other transformer-based models.",
        citation: "Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L., & Polosukhin, I. (2017). Attention is all you need. *Advances in Neural Information Processing Systems*, *30*. https://arxiv.org/abs/1706.03762",
        doi: "https://arxiv.org/abs/1706.03762",
        chapter: "Chapter 2: Literature Review"
    };
    papers.push(samplePaper);
    renderTable();
    updateStats();
    console.log('Sample data initialized successfully!');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Start with empty tracker
    renderTable();
    updateStats();
    showSummary();
});
