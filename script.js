// Research Paper Tracker - JavaScript
// Global variables - store data in JavaScript memory
let papers = [];
let nextId = 1;

// Summary function
function showSummary() {
    const summaryContainer = document.getElementById('papersSummary');
    if (!summaryContainer) return;
    
    if (papers.length === 0) {
        summaryContainer.style.display = 'flex';
        summaryContainer.style.justifyContent = 'center';
        summaryContainer.style.alignItems = 'center';
        summaryContainer.innerHTML = '<div style="grid-column: 1 / -1; display: flex; justify-content: center; align-items: center; color: #888; font-style: italic; padding: 40px; min-height: 100px;">No papers added yet. Add some papers to see them here!</div>';
        return;
    }
    
    // Reset container for grid display
    summaryContainer.style.display = 'grid';
    summaryContainer.style.justifyContent = '';
    summaryContainer.style.alignItems = '';
    
    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    // Validate URLs to prevent XSS
    const validateUrl = (url) => {
        if (!url) return '#';
        try {
            const urlObj = new URL(url);
            // Only allow http, https, and doi protocols
            if (['http:', 'https:'].includes(urlObj.protocol)) {
                return url;
            }
        } catch (e) {
            // Invalid URL
        }
        return '#';
    };
    
    // Generate summary cards
    const summaryHTML = papers.map(paper => {
        const keywords = paper.keywords ? paper.keywords.split(',').map(k => k.trim()).filter(k => k) : [];
        const keywordTags = keywords.map(keyword => 
            `<span class="keyword-tag">${escapeHtml(keyword)}</span>`
        ).join('');
        
        const stars = paper.rating ? '★'.repeat(Math.min(parseInt(paper.rating) || 0, 5)) : '';
        const paperUrl = validateUrl(paper.doi);
        
        return `
            <div class="paper-card">
                <div class="paper-status-info">
                    <span class="status-badge">${escapeHtml((paper.status || 'to-read').replace('-', ' '))}</span>
                    <div>
                        <span class="priority-badge">${escapeHtml(paper.priority || 'medium')}</span>
                        ${stars ? `<span class="rating-stars">${escapeHtml(stars)}</span>` : ''}
                    </div>
                </div>
                
                <div class="paper-title" ${paperUrl !== '#' ? `onclick="window.open('${escapeHtml(paperUrl)}', '_blank')"` : ''} title="Click to open paper">
                    ${escapeHtml(paper.title || 'Untitled Paper')}
                </div>
                
                ${paper.authors ? `<div class="paper-authors">${escapeHtml(paper.authors)}</div>` : ''}
                
                <div class="paper-year-journal">
                    ${paper.year ? escapeHtml(paper.year) : 'Year not specified'}
                    ${paper.journal ? ` • ${escapeHtml(paper.journal)}` : ''}
                </div>
                
                ${keywordTags ? `<div class="paper-keywords">${keywordTags}</div>` : ''}
                
                ${paper.keyPoints ? `<div class="paper-key-points" style="margin: 12px 0; padding: 10px; background: #f8f9fa; border-left: 3px solid #4a90e2; border-radius: 4px;">
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Key Points:</div>
                    <div style="font-size: 13px; line-height: 1.4; color: #555;">${escapeHtml(paper.keyPoints)}</div>
                </div>` : ''}
                
                ${paper.notes ? `<div class="paper-relevance" style="margin: 12px 0; padding: 10px; background: #fff8e1; border-left: 3px solid #ffa726; border-radius: 4px;">
                    <div style="font-weight: 600; color: #e65100; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Relevance & Notes:</div>
                    <div style="font-size: 13px; line-height: 1.4; color: #555;">${escapeHtml(paper.notes)}</div>
                </div>` : ''}
                
                ${paperUrl !== '#' ? `<a href="${escapeHtml(paperUrl)}" target="_blank" class="paper-link">📖 Open Paper</a>` : ''}
            </div>
        `;
    }).join('');
    
    summaryContainer.innerHTML = summaryHTML;
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
    const paperToDelete = papers.find(p => p.id === id);
    if (!paperToDelete) return;
    
    if (confirm(`Delete "${paperToDelete.title || 'Untitled Paper'}"?`)) {
        papers = papers.filter(paper => paper.id !== id);
        renderTable();
        updateStats();
        showSummary();
    }
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
    if (!paper) return;
    
    // Input validation and sanitization
    const sanitizeInput = (input, maxLength = 1000) => {
        if (typeof input !== 'string') return '';
        return input.trim().substring(0, maxLength);
    };
    
    const validateField = (fieldName, fieldValue) => {
        switch (fieldName) {
            case 'year':
                const yearNum = parseInt(fieldValue);
                return (!isNaN(yearNum) && yearNum >= 1000 && yearNum <= 2030) ? yearNum.toString() : '';
            case 'rating':
                const ratingNum = parseInt(fieldValue);
                return (!isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5) ? ratingNum.toString() : '';
            case 'status':
                return ['to-read', 'reading', 'read', 'skimmed'].includes(fieldValue) ? fieldValue : 'to-read';
            case 'priority':
                return ['low', 'medium', 'high'].includes(fieldValue) ? fieldValue : 'medium';
            case 'doi':
                // Basic URL/DOI validation
                if (!fieldValue) return '';
                try {
                    if (fieldValue.startsWith('http://') || fieldValue.startsWith('https://')) {
                        new URL(fieldValue); // Validates URL format
                        return sanitizeInput(fieldValue, 500);
                    } else if (fieldValue.match(/^10\.\d{4,}/)) {
                        return sanitizeInput(fieldValue, 200);
                    } else {
                        return sanitizeInput(fieldValue, 500);
                    }
                } catch {
                    return sanitizeInput(fieldValue, 500);
                }
            default:
                return sanitizeInput(fieldValue);
        }
    };
    
    const sanitizedValue = validateField(field, value);
    paper[field] = sanitizedValue;
    
    // Auto-format citation when key fields are updated
    if (['title', 'authors', 'year', 'journal'].includes(field)) {
        const citationData = formatAPA7CitationHTML(paper);
        if (citationData.text) {
            paper.citation = citationData.text;
            const citationDiv = document.querySelector(`div[data-citation-id="${id}"]`);
            if (citationDiv) {
                citationDiv.innerHTML = citationData.html || citationData.text;
                citationDiv.setAttribute('data-citation-text', citationData.text);
            }
        }
    }
    
    updateStats();
    setTimeout(() => updateRowStyling(id), 0);
    showSummary();
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
    
    // Clean and format authors
    let authors = paper.authors.trim();
    if (!authors) return "";
    
    // Handle multiple authors according to APA 7th edition
    const authorArray = authors.split(/,\s*(?=\w)/).map(author => author.trim());
    
    let formattedAuthors = "";
    if (authorArray.length === 1) {
        // Single author
        formattedAuthors = authorArray[0];
    } else if (authorArray.length === 2) {
        // Two authors: "Smith, J., & Jones, A."
        formattedAuthors = `${authorArray[0]}, & ${authorArray[1]}`;
    } else if (authorArray.length >= 3 && authorArray.length <= 20) {
        // 3-20 authors: "Smith, J., Jones, A., & Brown, C."
        const lastAuthor = authorArray[authorArray.length - 1];
        const otherAuthors = authorArray.slice(0, -1);
        formattedAuthors = `${otherAuthors.join(', ')}, & ${lastAuthor}`;
    } else if (authorArray.length > 20) {
        // More than 20 authors: list first 19, then "..." then last author
        const first19 = authorArray.slice(0, 19);
        const lastAuthor = authorArray[authorArray.length - 1];
        formattedAuthors = `${first19.join(', ')}, ... ${lastAuthor}`;
    }
    
    // Format year
    const year = paper.year ? `(${paper.year})` : "(n.d.)";
    
    // Format title (sentence case, no quotes for journal articles)
    const title = paper.title.trim();
    
    // Format journal name (italicized)
    const journal = paper.journal ? paper.journal.trim() : "";
    
    if (journal) {
        // Handle special cases
        if (journal.toLowerCase().includes('arxiv')) {
            // arXiv preprint format
            const arxivMatch = paper.doi ? paper.doi.match(/arxiv\.org\/abs\/([0-9]+\.[0-9]+)/) : null;
            const arxivId = arxivMatch ? arxivMatch[1] : "";
            return `${formattedAuthors} ${year}. ${title}. arXiv preprint${arxivId ? ` arXiv:${arxivId}` : ""}. ${paper.doi || ""}`.trim();
        } else {
            // Regular journal article
            let citation = `${formattedAuthors} ${year}. ${title}. ${journal}`;
            
            // Add volume (required for most journals)
            if (paper.volume) {
                citation += `, ${paper.volume}`;
            }
            
            // Add issue number in parentheses (if available)
            if (paper.issue) {
                citation += `(${paper.issue})`;
            }
            
            // Add page numbers with en-dash
            if (paper.pages) {
                const pages = paper.pages.replace(/-/g, '–'); // Convert hyphens to en-dashes
                citation += `, ${pages}`;
            }
            
            // Add DOI or URL
            if (paper.doi) {
                if (paper.doi.startsWith('http')) {
                    citation += `. ${paper.doi}`;
                } else if (paper.doi.startsWith('10.')) {
                    citation += `. https://doi.org/${paper.doi}`;
                } else {
                    citation += `. ${paper.doi}`;
                }
            }
            
            return citation + ".";
        }
    } else {
        // No journal (book, report, etc.)
        let citation = `${formattedAuthors} ${year}. ${title}`;
        
        // Add URL/DOI if available
        if (paper.doi) {
            if (paper.doi.startsWith('http')) {
                citation += `. ${paper.doi}`;
            } else if (paper.doi.startsWith('10.')) {
                citation += `. https://doi.org/${paper.doi}`;
            } else {
                citation += `. ${paper.doi}`;
            }
        }
        
        return citation + ".";
    }
}

// Create HTML version for display (with italics) and plain text version for copying
function formatAPA7CitationHTML(paper) {
    const plainText = formatAPA7Citation(paper);
    if (!plainText) return { html: "", text: "" };
    
    const journal = paper.journal ? paper.journal.trim() : "";
    let htmlVersion = plainText;
    
    if (journal && !journal.toLowerCase().includes('arxiv')) {
        // Italicize journal name and volume for display
        htmlVersion = htmlVersion.replace(new RegExp(`\\b${journal}\\b`), `<em>${journal}</em>`);
        
        // If there's a volume number after the journal, italicize it too
        if (paper.volume) {
            const volumePattern = new RegExp(`(<em>${journal}</em>), (${paper.volume})`);
            htmlVersion = htmlVersion.replace(volumePattern, `$1, <em>$2</em>`);
        }
    } else if (journal && journal.toLowerCase().includes('arxiv')) {
        // Italicize "arXiv preprint" for display
        htmlVersion = htmlVersion.replace('arXiv preprint', '<em>arXiv preprint</em>');
    }
    
    return { html: htmlVersion, text: plainText };
}

function renderTable() {
    const tbody = document.getElementById('paperTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    papers.forEach(paper => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', paper.id);
        row.className = `status-${paper.status} priority-${paper.priority}`;
        
        // Escape HTML in user input to prevent XSS
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        const citationData = formatAPA7CitationHTML(paper);
        
        row.innerHTML = `
            <td>
                <button onclick="deleteRow(${paper.id})" style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; white-space: nowrap;">Delete</button>
            </td>
            <td><input type="text" value="${escapeHtml(paper.title)}" onchange="updatePaper(${paper.id}, 'title', this.value)" placeholder="Paper title"></td>
            <td><input type="text" value="${escapeHtml(paper.authors)}" onchange="updatePaper(${paper.id}, 'authors', this.value)" placeholder="Author names"></td>
            <td><input type="number" value="${escapeHtml(paper.year)}" onchange="updatePaper(${paper.id}, 'year', this.value)" placeholder="2023" min="1900" max="2030"></td>
            <td><input type="text" value="${escapeHtml(paper.journal)}" onchange="updatePaper(${paper.id}, 'journal', this.value)" placeholder="Journal name"></td>
            <td><input type="text" value="${escapeHtml(paper.keywords)}" onchange="updatePaper(${paper.id}, 'keywords', this.value)" placeholder="keyword1, keyword2"></td>
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
            <td><input type="date" value="${escapeHtml(paper.dateAdded)}" onchange="updatePaper(${paper.id}, 'dateAdded', this.value)"></td>
            <td><textarea onchange="updatePaper(${paper.id}, 'keyPoints', this.value)" placeholder="Main findings, methodology, key insights...">${escapeHtml(paper.keyPoints)}</textarea></td>
            <td><textarea onchange="updatePaper(${paper.id}, 'notes', this.value)" placeholder="Relevance to dissertation, connections to other work, critical analysis...">${escapeHtml(paper.notes)}</textarea></td>
            <td>
                <div class="citation-container">
                    <div class="citation-display" data-citation-id="${paper.id}" data-citation-text="${escapeHtml(citationData.text)}" title="Click to copy citation">
                        ${citationData.html || citationData.text || '<em>Enter title, authors, year, and journal to auto-generate APA citation</em>'}
                    </div>
                    <button class="copy-citation-btn" onclick="copyCitation(${paper.id})" title="Copy citation to clipboard">📋</button>
                </div>
            </td>
            <td><input type="url" value="${escapeHtml(paper.doi)}" onchange="updatePaper(${paper.id}, 'doi', this.value)" placeholder="DOI or URL"></td>
            <td><input type="text" value="${escapeHtml(paper.chapter)}" onchange="updatePaper(${paper.id}, 'chapter', this.value)" placeholder="Chapter 1, Literature Review, etc."></td>
        `;
        
        tbody.appendChild(row);
    });
}

// Copy citation to clipboard
function copyCitation(id) {
    const citationDiv = document.querySelector(`div[data-citation-id="${id}"]`);
    if (!citationDiv) return;
    
    const citationText = citationDiv.getAttribute('data-citation-text');
    if (!citationText) {
        alert('No citation available to copy');
        return;
    }
    
    // Try to use the modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(citationText).then(() => {
            showCopyFeedback(id);
        }).catch(() => {
            // Fallback to legacy method
            fallbackCopy(citationText, id);
        });
    } else {
        // Fallback to legacy method
        fallbackCopy(citationText, id);
    }
}

function fallbackCopy(text, id) {
    // Create a temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback(id);
    } catch (err) {
        alert('Failed to copy citation. Please manually select and copy the text.');
    }
    
    document.body.removeChild(textarea);
}

function showCopyFeedback(id) {
    const button = document.querySelector(`button[onclick="copyCitation(${id})"]`);
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '✅';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    }
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
    if (!file) return;
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
    }
    
    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File is too large. Please select a file smaller than 10MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            
            let importCount = 0;
            const maxRows = 1000; // Prevent memory issues
            
            for (let i = 1; i < Math.min(lines.length, maxRows + 1); i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
                if (values.length < 3) continue; // Minimum required fields
                
                const cleanValue = (val) => val ? val.replace(/^"|"$/g, '').trim() : '';
                
                const paper = {
                    id: nextId++,
                    title: cleanValue(values[0]).substring(0, 500),
                    authors: cleanValue(values[1]).substring(0, 500),
                    year: cleanValue(values[2]).substring(0, 4),
                    journal: cleanValue(values[3]).substring(0, 300),
                    keywords: cleanValue(values[4]).substring(0, 500),
                    status: ['to-read', 'reading', 'read', 'skimmed'].includes(cleanValue(values[5])) ? cleanValue(values[5]) : 'to-read',
                    priority: ['low', 'medium', 'high'].includes(cleanValue(values[6])) ? cleanValue(values[6]) : 'medium',
                    rating: ['1','2','3','4','5'].includes(cleanValue(values[7])) ? cleanValue(values[7]) : '',
                    dateAdded: cleanValue(values[8]) || new Date().toISOString().split('T')[0],
                    keyPoints: cleanValue(values[9]).substring(0, 2000),
                    notes: cleanValue(values[10]).substring(0, 1000),
                    citation: cleanValue(values[11]).substring(0, 1000),
                    doi: cleanValue(values[12]).substring(0, 500),
                    chapter: cleanValue(values[13]).substring(0, 200)
                };
                
                papers.push(paper);
                importCount++;
            }
            
            if (importCount > 0) {
                renderTable();
                updateStats();
                showSummary();
                alert(`Successfully imported ${importCount} papers`);
            } else {
                alert('No valid papers found in the CSV file');
            }
        } catch (error) {
            alert('Error reading CSV file. Please check the file format');
        }
    };
    
    reader.onerror = function() {
        alert('Error reading file');
    };
    
    reader.readAsText(file);
}

// Smart input processing function
async function addFromSmartInput() {
    const input = document.getElementById('extractedData').value.trim();
    if (!input) {
        alert('Please enter a paper title, URL, DOI, or citation information!');
        return;
    }

    // Limit input length to prevent potential issues
    if (input.length > 10000) {
        alert('Input is too long. Please limit to 10,000 characters.');
        return;
    }

    // Check if input is already valid JSON
    try {
        const paperInfo = JSON.parse(input);
        
        // Validate that it's an object with expected structure
        if (typeof paperInfo !== 'object' || paperInfo === null || Array.isArray(paperInfo)) {
            throw new Error('Invalid JSON structure');
        }
        
        // Validate required JSON structure for paper info
        const validKeys = ['title', 'authors', 'year', 'journal', 'keywords', 'abstract', 'url', 'relevance'];
        const hasValidStructure = Object.keys(paperInfo).some(key => validKeys.includes(key));
        
        if (!hasValidStructure) {
            throw new Error('JSON does not contain expected paper fields');
        }
        
        // Valid JSON - show preview modal
        showPreviewModal(paperInfo);
        return;
    } catch (e) {
        // Not valid JSON or not paper structure - show Claude prompt instead
        showClaudePrompt(input);
        return;
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
        if (textarea) {
            textarea.focus();
            textarea.select();
        }
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
    if (textarea) {
        textarea.select();
        document.execCommand('copy');
        
        // Show feedback
        const button = document.querySelector('.modal-btn-primary');
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '✅ Copied!';
            button.style.background = '#28a745';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '#4a90e2';
            }, 2000);
        }
    }
}

// Show preview modal with extracted information
function showPreviewModal(paperInfo) {
    // Validate and sanitize paperInfo
    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text.toString();
        return div.innerHTML;
    };
    
    const sanitizedPaper = {
        title: escapeHtml(paperInfo.title || ''),
        authors: escapeHtml(paperInfo.authors || ''),
        year: escapeHtml(paperInfo.year || ''),
        journal: escapeHtml(paperInfo.journal || ''),
        keywords: escapeHtml(paperInfo.keywords || ''),
        abstract: escapeHtml(paperInfo.abstract || ''),
        url: escapeHtml(paperInfo.url || ''),
        relevance: escapeHtml(paperInfo.relevance || '')
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Paper Information Found</h3>
                <button class="modal-close" onclick="closePreviewModal()">&times;</button>
            </div>
            <div class="modal-content">
                <div class="modal-field">
                    <label>Title</label>
                    <input type="text" id="preview-title" value="${sanitizedPaper.title}" maxlength="500">
                </div>
                <div class="modal-field">
                    <label>Authors</label>
                    <input type="text" id="preview-authors" value="${sanitizedPaper.authors}" maxlength="500">
                </div>
                <div class="modal-field">
                    <label>Year</label>
                    <input type="number" id="preview-year" value="${sanitizedPaper.year}" min="1000" max="2030">
                </div>
                <div class="modal-field">
                    <label>Journal/Venue</label>
                    <input type="text" id="preview-journal" value="${sanitizedPaper.journal}" maxlength="300">
                </div>
                <div class="modal-field">
                    <label>Keywords</label>
                    <input type="text" id="preview-keywords" value="${sanitizedPaper.keywords}" maxlength="500">
                </div>
                <div class="modal-field">
                    <label>Key Points/Abstract</label>
                    <textarea id="preview-abstract" maxlength="2000">${sanitizedPaper.abstract}</textarea>
                </div>
                <div class="modal-field">
                    <label>DOI/URL</label>
                    <input type="url" id="preview-url" value="${sanitizedPaper.url}" maxlength="500">
                </div>
                <div class="modal-field">
                    <label>Relevance/Notes</label>
                    <textarea id="preview-relevance" maxlength="1000">${sanitizedPaper.relevance}</textarea>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-secondary" onclick="closePreviewModal()">Cancel</button>
                <button class="modal-btn modal-btn-primary" onclick="addPaperFromPreview()">Add to Library</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus first input with safety check
    setTimeout(() => {
        const titleInput = document.getElementById('preview-title');
        if (titleInput) titleInput.focus();
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
    const titleEl = document.getElementById('preview-title');
    const authorsEl = document.getElementById('preview-authors');
    const yearEl = document.getElementById('preview-year');
    const journalEl = document.getElementById('preview-journal');
    const keywordsEl = document.getElementById('preview-keywords');
    const abstractEl = document.getElementById('preview-abstract');
    const urlEl = document.getElementById('preview-url');
    const relevanceEl = document.getElementById('preview-relevance');
    
    if (!titleEl || !authorsEl || !yearEl || !journalEl || !keywordsEl || !abstractEl || !urlEl || !relevanceEl) {
        alert('Error: Could not find all required form fields');
        return;
    }
    
    const newPaper = {
        id: nextId++,
        title: titleEl.value || '',
        authors: authorsEl.value || '',
        year: yearEl.value || '',
        journal: journalEl.value || '',
        keywords: keywordsEl.value || '',
        status: "to-read",
        priority: "medium",
        rating: "",
        dateAdded: new Date().toISOString().split('T')[0],
        keyPoints: abstractEl.value || '',
        notes: relevanceEl.value || '',
        citation: "",
        doi: urlEl.value || '',
        chapter: ""
    };
    
    // Auto-generate citation
    const citationData = formatAPA7CitationHTML(newPaper);
    if (citationData.text) {
        newPaper.citation = citationData.text;
    }
    
    papers.push(newPaper);
    renderTable();
    updateStats();
    showSummary();
    
    // Clear input and close modal
    const extractedDataEl = document.getElementById('extractedData');
    if (extractedDataEl) extractedDataEl.value = '';
    closePreviewModal();
    
    alert('Paper added successfully to your library!');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Start with empty tracker
    updateStats();
    showSummary();
});
