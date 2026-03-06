const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Daily Work Logger - Template System for Future Logging
 * Run this at the end of each work day to generate a structured log
 */

const LOG_DIR = './work-logs/daily';
const TODAY = new Date().toISOString().split('T')[0];

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

console.log('📝 Daily Work Logger\n');
console.log(`Date: ${TODAY}\n`);

// Check if log already exists
const logPath = path.join(LOG_DIR, `${TODAY}.md`);
if (fs.existsSync(logPath)) {
    console.log('⚠️  A log for today already exists!');
    console.log(`   Location: ${logPath}`);
    console.log('\n   Options:');
    console.log('   1. Delete the existing log and create a new one');
    console.log('   2. Append to the existing log');
    console.log('   3. Cancel\n');
    process.exit(0);
}

// Get today's git commits
let todayCommits = [];
try {
    const gitLog = execSync(
        `git log --since="00:00:00" --until="23:59:59" --pretty=format:"%H|%s" --numstat`,
        { encoding: 'utf-8' }
    );
    
    const lines = gitLog.split('\n');
    let currentCommit = null;
    
    for (const line of lines) {
        if (line.includes('|')) {
            const [hash, message] = line.split('|');
            currentCommit = {
                hash: hash.substring(0, 7),
                message,
                files: []
            };
            todayCommits.push(currentCommit);
        } else if (line.trim() && currentCommit) {
            const parts = line.trim().split('\t');
            if (parts.length === 3) {
                const [additions, deletions, filename] = parts;
                currentCommit.files.push({
                    filename,
                    additions: additions === '-' ? 0 : parseInt(additions),
                    deletions: deletions === '-' ? 0 : parseInt(deletions)
                });
            }
        }
    }
} catch (error) {
    console.log('⚠️  Could not fetch git commits for today');
}

console.log(`Found ${todayCommits.length} commits today\n`);

// Generate template
const template = generateDailyLogTemplate(todayCommits);

// Save template
fs.writeFileSync(logPath, template);

console.log(`✅ Daily log template created: ${logPath}`);
console.log('\n📝 Next steps:');
console.log('   1. Open the file and fill in the details');
console.log('   2. Add focus area, features implemented, errors encountered, etc.');
console.log('   3. Save the file when complete\n');

function generateDailyLogTemplate(commits) {
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const dateFormatted = new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });

    const totalFiles = commits.reduce((sum, c) => sum + c.files.length, 0);
    const totalAdditions = commits.reduce((sum, c) => 
        sum + c.files.reduce((s, f) => s + f.additions, 0), 0
    );
    const totalDeletions = commits.reduce((sum, c) => 
        sum + c.files.reduce((s, f) => s + f.deletions, 0), 0
    );

    // Extract unique files
    const allFiles = new Set();
    commits.forEach(c => c.files.forEach(f => allFiles.add(f.filename)));

    return `# Daily Work Log

**Developer:** Mayur  
**Date:** ${dayOfWeek}, ${dateFormatted}  
**Project:** CivicPath – Civic Complaint Management System  
**Focus Area:** [TODO: Add focus area - e.g., "Photo Display & Cloudinary Integration"]  
**Total Time:** [TODO: Add estimated hours - e.g., "~6 hours"]  
**Status:** [TODO: Add status - e.g., "Production Ready", "In Progress", "Blocked"]

---

## Executive Summary

[TODO: Write 2-3 sentences summarizing what was accomplished today]

---

## Features Implemented

### Feature 1: [TODO: Feature Name]

[TODO: Describe the feature]

**Files Modified:**
${allFiles.size > 0 ? Array.from(allFiles).slice(0, 5).map(f => `- \`${f}\``).join('\n') : '- [TODO: List files]'}

**Implementation Details:**
- [TODO: Add implementation detail 1]
- [TODO: Add implementation detail 2]

### Feature 2: [TODO: Feature Name]

[TODO: Describe the feature or remove this section if not applicable]

---

## Errors Encountered & Resolved

### Error 1 – [TODO: Error Name]

**Problem:** [TODO: Describe the problem]

**Root Cause:** [TODO: Explain the root cause]

**Solution:** [TODO: Describe how it was fixed]

**Files Modified:** [TODO: List files]

### Error 2 – [TODO: Error Name]

[TODO: Add more errors or remove this section]

---

## Git Commits (${commits.length} total)

${commits.length > 0 ? commits.map((commit, i) => `
### ${i + 1}. ${commit.message}

- **Hash:** \`${commit.hash}\`
- **Files:** ${commit.files.length}
- **Changes:** +${commit.files.reduce((s, f) => s + f.additions, 0)} -${commit.files.reduce((s, f) => s + f.deletions, 0)}

${commit.files.length > 0 ? commit.files.map(f => `  - \`${f.filename}\` (+${f.additions} -${f.deletions})`).join('\n') : ''}
`).join('\n') : '[No commits found for today]'}

---

## Statistics

- **Commits:** ${commits.length}
- **Files Modified:** ${totalFiles}
- **Lines Added:** ${totalAdditions}
- **Lines Deleted:** ${totalDeletions}
- **Net Change:** ${totalAdditions - totalDeletions} lines

---

## Tech Stack & Deployments

**Frontend:**
- Framework: Next.js 14, React, TypeScript, Tailwind CSS
- Deployment: [TODO: Add deployment URL if deployed today]

**Backend:**
- Stack: Node.js, Express, PostgreSQL
- Deployment: [TODO: Add deployment URL if deployed today]

**Other:**
- [TODO: Add any other relevant tech or services used]

**Deployments Made:** [TODO: Add count - e.g., "6 total (2 backend, 4 frontend)"]

---

## Database Changes

[TODO: List any database schema changes, migrations, or data updates]

Example:
- Added columns: \`created_at\`, \`updated_at\` to \`complaints\` table
- Inserted 8 records into \`complaint_attachments\` table
- [TODO: Add more or remove if no database changes]

---

## Lessons Learned

[TODO: Add key lessons learned today]

Example:
- Always verify database schema before writing queries
- Environment variables must be set correctly and build caches cleared
- Avoid direct DOM manipulation in React event handlers
- [TODO: Add more lessons]

---

## Next Steps

### Immediate Priorities
- [TODO: Add immediate next steps]
- [TODO: Add testing tasks]
- [TODO: Add verification tasks]

### Future Enhancements
- [TODO: Add planned future features]
- [TODO: Add technical debt items]
- [TODO: Add optimization opportunities]

---

## Notes

[TODO: Add any additional notes, blockers, or important information]

---

*Generated: ${new Date().toISOString()}*
`;
}
