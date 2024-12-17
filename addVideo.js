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
    try {
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

        // Check if a div with the class already exists and replace it
        const classRegex = new RegExp(`<div class="${classNumber}">[\\s\\S]*?</div>`);
        if (classRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(classRegex, newDiv);
            console.log(`Replaced existing video with class="${classNumber}".`);
        } else {
            // Add the new div if no replacement is needed
            htmlContent = htmlContent.replace(
                /(<div class="grid-container">[\s\S]*)(<\/div>)(\s*<\/div>)/,
                `$1$2${newDiv}$3`
            );
            console.log(`Added new video with class="${classNumber}".`);
        }

        fs.writeFileSync(filePath, htmlContent, 'utf-8');
        console.log('Operation completed successfully!');
    } catch (error) {
        console.error('Error adding video:', error);
    } finally {
        rl.close();
    }
}

addNewVideo();
