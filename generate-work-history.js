const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Git History Analyzer & Daily Work Log Generator
 * Analyzes git commits from a date range and generates detailed daily reports
 */

const START_DATE = '2023-02-17';
const END_DATE = '2026-03-05';
const OUTPUT_DIR = './work-logs';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('📊 Generating Work History Report...\n');
console.log(`Date Range: ${START_DATE} to ${END_DATE}\n`);

try {
    // Get all commits in date range with detailed info
    const gitLog = execSync(
        `git log --since="${START_DATE}" --until="${END_DATE}" --pretty=format:"%H|%ad|%s|%an" --date=short --numstat`,
        { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );

    // Parse git log
    const lines = gitLog.split('\n');
    const commitsByDate = {};
    let currentCommit = null;

    for (const line of lines) {
        if (line.includes('|')) {
            // Commit header line
            const [hash, date, message, author] = line.split('|');
            
            if (!commitsByDate[date]) {
                commitsByDate[date] = [];
            }

            currentCommit = {
                hash: hash.substring(0, 7),
                date,
                message,
                author,
                files: []
            };
            commitsByDate[date].push(currentCommit);
        } else if (line.trim() && currentCommit) {
            // File change line (additions deletions filename)
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

    // Generate summary statistics
    const dates = Object.keys(commitsByDate).sort();
    const totalCommits = dates.reduce((sum, date) => sum + commitsByDate[date].length, 0);
    
    console.log(`✅ Found ${totalCommits} commits across ${dates.length} days\n`);

    // Generate overall summary
    generateOverallSummary(commitsByDate, dates);

    // Generate daily reports
    generateDailyReports(commitsByDate, dates);

    // Generate monthly summaries
    generateMonthlySummaries(commitsByDate, dates);

    console.log('\n✅ Work history generation complete!');
    console.log(`\n📁 Reports saved to: ${OUTPUT_DIR}/`);
    console.log(`   - WORK-HISTORY-SUMMARY.md (overall summary)`);
    console.log(`   - daily/ (individual daily reports)`);
    console.log(`   - monthly/ (monthly summaries)`);

} catch (error) {
    console.error('❌ Error generating work history:', error.message);
    process.exit(1);
}

function generateOverallSummary(commitsByDate, dates) {
    const totalCommits = dates.reduce((sum, date) => sum + commitsByDate[date].length, 0);
    const totalFiles = dates.reduce((sum, date) => {
        return sum + commitsByDate[date].reduce((fileSum, commit) => {
            return fileSum + commit.files.length;
        }, 0);
    }, 0);

    const totalAdditions = dates.reduce((sum, date) => {
        return sum + commitsByDate[date].reduce((addSum, commit) => {
            return addSum + commit.files.reduce((lineSum, file) => lineSum + file.additions, 0);
        }, 0);
    }, 0);

    const totalDeletions = dates.reduce((sum, date) => {
        return sum + commitsByDate[date].reduce((delSum, commit) => {
            return delSum + commit.files.reduce((lineSum, file) => lineSum + file.deletions, 0);
        }, 0);
    }, 0);

    // Categorize commits by type
    const commitTypes = {
        features: [],
        fixes: [],
        docs: [],
        refactor: [],
        style: [],
        test: [],
        chore: [],
        other: []
    };

    dates.forEach(date => {
        commitsByDate[date].forEach(commit => {
            const msg = commit.message.toLowerCase();
            if (msg.includes('feat') || msg.includes('add') || msg.includes('implement')) {
                commitTypes.features.push(commit);
            } else if (msg.includes('fix') || msg.includes('bug') || msg.includes('error')) {
                commitTypes.fixes.push(commit);
            } else if (msg.includes('doc') || msg.includes('readme')) {
                commitTypes.docs.push(commit);
            } else if (msg.includes('refactor') || msg.includes('restructure')) {
                commitTypes.refactor.push(commit);
            } else if (msg.includes('style') || msg.includes('format')) {
                commitTypes.style.push(commit);
            } else if (msg.includes('test')) {
                commitTypes.test.push(commit);
            } else if (msg.includes('chore') || msg.includes('update')) {
                commitTypes.chore.push(commit);
            } else {
                commitTypes.other.push(commit);
            }
        });
    });

    const summary = `# CivicPath Development Work History

**Project:** CivicPath - Civic Complaint Management System  
**Developer:** Mayur  
**Period:** ${START_DATE} to ${END_DATE}  
**Generated:** ${new Date().toISOString().split('T')[0]}

---

## Executive Summary

This document provides a comprehensive overview of all development work completed on the CivicPath project from ${START_DATE} to ${END_DATE}.

### Overall Statistics

- **Total Days Active:** ${dates.length}
- **Total Commits:** ${totalCommits}
- **Total Files Modified:** ${totalFiles}
- **Lines Added:** ${totalAdditions.toLocaleString()}
- **Lines Deleted:** ${totalDeletions.toLocaleString()}
- **Net Change:** ${(totalAdditions - totalDeletions).toLocaleString()} lines

### Commit Breakdown by Type

| Type | Count | Percentage |
|------|-------|------------|
| Features | ${commitTypes.features.length} | ${((commitTypes.features.length / totalCommits) * 100).toFixed(1)}% |
| Bug Fixes | ${commitTypes.fixes.length} | ${((commitTypes.fixes.length / totalCommits) * 100).toFixed(1)}% |
| Documentation | ${commitTypes.docs.length} | ${((commitTypes.docs.length / totalCommits) * 100).toFixed(1)}% |
| Refactoring | ${commitTypes.refactor.length} | ${((commitTypes.refactor.length / totalCommits) * 100).toFixed(1)}% |
| Style/Format | ${commitTypes.style.length} | ${((commitTypes.style.length / totalCommits) * 100).toFixed(1)}% |
| Tests | ${commitTypes.test.length} | ${((commitTypes.test.length / totalCommits) * 100).toFixed(1)}% |
| Chores | ${commitTypes.chore.length} | ${((commitTypes.chore.length / totalCommits) * 100).toFixed(1)}% |
| Other | ${commitTypes.other.length} | ${((commitTypes.other.length / totalCommits) * 100).toFixed(1)}% |

### Most Active Days

${dates.slice(0, 10).map(date => {
    const commits = commitsByDate[date];
    return `- **${date}**: ${commits.length} commits`;
}).join('\n')}

### Development Timeline

${dates.length > 0 ? `
- **First Commit:** ${dates[0]}
- **Last Commit:** ${dates[dates.length - 1]}
- **Total Duration:** ${Math.ceil((new Date(dates[dates.length - 1]) - new Date(dates[0])) / (1000 * 60 * 60 * 24))} days
` : 'No commits found in date range'}

---

## Daily Reports

Individual daily reports are available in the \`daily/\` directory.

## Monthly Summaries

Monthly summary reports are available in the \`monthly/\` directory.

---

*Generated automatically from git commit history*
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'WORK-HISTORY-SUMMARY.md'), summary);
    console.log('✅ Generated overall summary');
}

function generateDailyReports(commitsByDate, dates) {
    const dailyDir = path.join(OUTPUT_DIR, 'daily');
    if (!fs.existsSync(dailyDir)) {
        fs.mkdirSync(dailyDir, { recursive: true });
    }

    dates.forEach(date => {
        const commits = commitsByDate[date];
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        
        const totalFiles = commits.reduce((sum, c) => sum + c.files.length, 0);
        const totalAdditions = commits.reduce((sum, c) => 
            sum + c.files.reduce((s, f) => s + f.additions, 0), 0
        );
        const totalDeletions = commits.reduce((sum, c) => 
            sum + c.files.reduce((s, f) => s + f.deletions, 0), 0
        );

        // Group files by type
        const filesByType = {};
        commits.forEach(commit => {
            commit.files.forEach(file => {
                const ext = path.extname(file.filename) || 'other';
                if (!filesByType[ext]) {
                    filesByType[ext] = [];
                }
                filesByType[ext].push(file.filename);
            });
        });

        const report = `# Daily Work Log - ${date}

**Developer:** Mayur  
**Date:** ${dayOfWeek}, ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  
**Project:** CivicPath - Civic Complaint Management System

---

## Summary

- **Commits:** ${commits.length}
- **Files Modified:** ${totalFiles}
- **Lines Added:** ${totalAdditions}
- **Lines Deleted:** ${totalDeletions}
- **Net Change:** ${totalAdditions - totalDeletions} lines

## Commits

${commits.map((commit, index) => `
### ${index + 1}. ${commit.message}

- **Hash:** \`${commit.hash}\`
- **Files Changed:** ${commit.files.length}
- **Lines:** +${commit.files.reduce((s, f) => s + f.additions, 0)} -${commit.files.reduce((s, f) => s + f.deletions, 0)}

${commit.files.length > 0 ? `**Modified Files:**\n${commit.files.map(f => `- \`${f.filename}\` (+${f.additions} -${f.deletions})`).join('\n')}` : ''}
`).join('\n')}

## Files Modified by Type

${Object.keys(filesByType).map(ext => `
### ${ext === 'other' ? 'No Extension' : ext} Files (${filesByType[ext].length})

${[...new Set(filesByType[ext])].map(f => `- ${f}`).join('\n')}
`).join('\n')}

---

*Generated from git commit history*
`;

        fs.writeFileSync(path.join(dailyDir, `${date}.md`), report);
    });

    console.log(`✅ Generated ${dates.length} daily reports`);
}

function generateMonthlySummaries(commitsByDate, dates) {
    const monthlyDir = path.join(OUTPUT_DIR, 'monthly');
    if (!fs.existsSync(monthlyDir)) {
        fs.mkdirSync(monthlyDir, { recursive: true });
    }

    // Group by month
    const byMonth = {};
    dates.forEach(date => {
        const month = date.substring(0, 7); // YYYY-MM
        if (!byMonth[month]) {
            byMonth[month] = [];
        }
        byMonth[month].push(date);
    });

    Object.keys(byMonth).sort().forEach(month => {
        const monthDates = byMonth[month];
        const monthCommits = monthDates.flatMap(date => commitsByDate[date]);
        
        const totalCommits = monthCommits.length;
        const totalFiles = monthCommits.reduce((sum, c) => sum + c.files.length, 0);
        const totalAdditions = monthCommits.reduce((sum, c) => 
            sum + c.files.reduce((s, f) => s + f.additions, 0), 0
        );
        const totalDeletions = monthCommits.reduce((sum, c) => 
            sum + c.files.reduce((s, f) => s + f.deletions, 0), 0
        );

        const monthName = new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const summary = `# Monthly Summary - ${monthName}

**Developer:** Mayur  
**Project:** CivicPath - Civic Complaint Management System  
**Period:** ${month}

---

## Overview

- **Active Days:** ${monthDates.length}
- **Total Commits:** ${totalCommits}
- **Files Modified:** ${totalFiles}
- **Lines Added:** ${totalAdditions.toLocaleString()}
- **Lines Deleted:** ${totalDeletions.toLocaleString()}
- **Net Change:** ${(totalAdditions - totalDeletions).toLocaleString()} lines

## Daily Breakdown

${monthDates.map(date => {
    const dayCommits = commitsByDate[date];
    return `- **${date}**: ${dayCommits.length} commits`;
}).join('\n')}

## Key Commits

${monthCommits.slice(0, 20).map(commit => `
- \`${commit.hash}\` - ${commit.message}
`).join('')}

${monthCommits.length > 20 ? `\n*... and ${monthCommits.length - 20} more commits*\n` : ''}

---

*Generated from git commit history*
`;

        fs.writeFileSync(path.join(monthlyDir, `${month}.md`), summary);
    });

    console.log(`✅ Generated ${Object.keys(byMonth).length} monthly summaries`);
}
