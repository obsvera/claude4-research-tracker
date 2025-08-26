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
        summaryContainer.style.textAlign = 'center';
        summaryContainer.innerHTML = '<div style="color: #888; font-style: italic; padding: 40px;">No papers added yet. Add some papers to see them here!</div>';
        return;
    } else {
        summaryContainer.style.textAlign = 'left'; // Reset for paper cards
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

async function addFromExtractedData() {
    const data = document.getElementById('extractedData').value.trim();
    if (!data) {
        alert('Please paste the extracted paper data first in JSON format!');
        return;
    }

    const button = document.getElementById('dataBtn');
    const originalText = button.innerHTML;
    button.innerHTML = '📋 Adding...';
    button.disabled = true;

    try {
        let paperInfo;
        try {
            paperInfo = JSON.parse(data);
        } catch (e) {
            // Fallback to comma-separated format
            const parts = data.split(',').map(s => s.trim());
            if (parts.length >= 3) {
                paperInfo = {
                    title: parts[0] || "",
                    authors: parts[1] || "",
                    year: parts[2] || "",
                    journal: parts[3] || "",
                    keywords: parts[4] || "",
                    abstract: parts[5] || "",
                    citation: parts[6] || "",
                    relevance: parts[7] || ""
                };
            } else {
                throw new Error('Invalid format');
            }
        }
        
        const newPaper = {
            id: nextId++,
            title: paperInfo.title || "",
            authors: paperInfo.authors || "",
            year: paperInfo.year || "",
            journal: paperInfo.journal || "",
            keywords: paperInfo.keywords || "",
            status: "to-read",
            priority: "medium",
            rating: "",
            dateAdded: new Date().toISOString().split('T')[0],
            keyPoints: paperInfo.abstract || "",
            notes: paperInfo.relevance || "",
            citation: paperInfo.citation || "",
            doi: paperInfo.url || paperInfo.doi || "",
            chapter: ""
        };
        
        const apaCitation = formatAPA7Citation(newPaper);
        if (apaCitation) {
            newPaper.citation = apaCitation;
        }
        
        papers.push(newPaper);
        renderTable();
        updateStats();
        
        document.getElementById('extractedData').value = '';
        alert('✅ Paper added successfully with APA 7th edition citation!');
        
    } catch (error) {
        alert('❌ Could not parse the extracted data. Please make sure it\'s in the correct JSON format.');
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
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
