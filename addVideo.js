const fs = require('fs');
const readline = require('readline');

const filePath = 'index.html';

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

        const newDiv = `

        <div class="${nextClassNumber}">
            <iframe src="${link}"></iframe>
            <a href="${link}" target="_blank"><h1>${title}</h1></a>
        </div>`;

        htmlContent = htmlContent.replace(
            /(<div class="grid-container">[\s\S]*)(<\/div>)(\s*<\/div>)/,
            `$1$2${newDiv}$3`
        );

        fs.writeFileSync(filePath, htmlContent, 'utf-8');
        console.log(`New video added successfully with class="${nextClassNumber}"!`);
    } catch (error) {
        console.error('Error adding video:', error);
    } finally {
        rl.close();
    }
}

addNewVideo();
