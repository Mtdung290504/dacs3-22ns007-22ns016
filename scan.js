const fs = require('fs');
let total = 0;

// Danh sách file/thư mục muốn bỏ qua
const ignoreFiles = [
    'node_modules',
    '.git',
    '.gitignore',
    'package-lock.json',
    'package.json',
    'scan.js',
    'uploads',
    'images',
];

// Hàm đếm số dòng của file
function countLines(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) return reject(err);

            const lines = data.split('\n').length;
            resolve(lines);
        });
    });
}

// Hàm duyệt toàn bộ thư mục
async function scanDirectory(dir) {
    const files = await fs.promises.readdir(dir);

    for (let file of files) {
        const filepath = `${dir}/${file}`;

        if (ignoreFiles.includes(file)) continue;

        if (fs.statSync(filepath).isDirectory()) {
            await scanDirectory(filepath);
            continue;
        }

        const lines = await countLines(filepath);
        total += lines;
        console.log(`${filepath}: ${lines}`);
    }
}

scanDirectory('./').then(() => {
    console.log('Total:', total, 'lines');
    console.log('Done!');
});