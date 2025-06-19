const fs = require('fs');
const readline = require('readline');

const filePath = 'content.html';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function addNewVideo() {
    const title = await askQuestion('Enter the title for the new video: ');
    const link = await askQuestion('Enter the video link (URL): ');

    if (!title || !link) {
        console.log('Both title and link are required. Exiting.');
        rl.close();
        return;
    }

    let htmlContent = fs.readFileSync(filePath, 'utf-8');

    const divCount = (htmlContent.match(/<div class="\d+"/g) || []).length;
    const nextClassNumber = divCount + 1;

    const classInput = await askQuestion(`Enter the class number (leave blank for ${nextClassNumber}): `);
    const classNumber = classInput.trim() ? parseInt(classInput, 10) : nextClassNumber;

    if (isNaN(classNumber)) {
        console.log('Invalid class number entered. Exiting.');
        rl.close();
        return;
    }

    const newDiv = `
        <div class="${classNumber}">
            <iframe src="${link}"></iframe>
            <a href="${link}" target="_blank"><h1>${title}</h1></a>
        </div>`;

    // Replace if class exists
    const classRegex = new RegExp(`<div class="${classNumber}">[\\s\\S]*?<\\/div>`);
    if (classRegex.test(htmlContent)) {
        htmlContent = htmlContent.replace(classRegex, newDiv);
        console.log(`Replaced existing video with class="${classNumber}".`);
    } else {
        htmlContent = htmlContent.replace(
            /(<div class="grid-container">[\s\S]*?)(<\/div>)(\s*<\/div>)/,
            `$1${newDiv}$2$3`
        );
        console.log(`Added new video with class="${classNumber}".`);
    }

    fs.writeFileSync(filePath, htmlContent, 'utf-8');
    console.log('Operation completed successfully!');
    rl.close();
}

function removeVideo(classNumberToRemove) {
    let htmlContent = fs.readFileSync(filePath, 'utf-8');

    // Match and remove the div with the given class
    const targetRegex = new RegExp(`<div class="${classNumberToRemove}">[\\s\\S]*?<\\/div>\\s*`, 'g');
    if (!targetRegex.test(htmlContent)) {
        console.log(`No video found with class="${classNumberToRemove}".`);
        rl.close();
        return;
    }

    htmlContent = htmlContent.replace(targetRegex, '');

    // Renumber all following divs
    let currentNumber = classNumberToRemove + 1;
    while (true) {
        const oldClassRegex = new RegExp(`(<div class=")${currentNumber}(">)`, 'g');
        if (!oldClassRegex.test(htmlContent)) break;
        htmlContent = htmlContent.replace(oldClassRegex, `$1${currentNumber - 1}$2`);
        currentNumber++;
    }

    fs.writeFileSync(filePath, htmlContent, 'utf-8');
    console.log(`Removed video with class="${classNumberToRemove}" and renumbered subsequent entries.`);
    rl.close();
}

async function main() {
    const mode = await askQuestion('Type "1" to add a video or "2" to remove one: ');
    if (mode.trim().toLowerCase() === '2') {
        const numInput = await askQuestion('Enter the class number to remove: ');
        const classNumber = parseInt(numInput.trim(), 10);
        if (isNaN(classNumber)) {
            console.log('Invalid number. Exiting.');
            rl.close();
        } else {
            removeVideo(classNumber);
        }
    } else {
        await addNewVideo();
    }
}

main();
