export default function (dir) {
    try {
        fs.statSync(dir);
    } catch (err) {
        if (err.code === 'ENOENT') {
            fs.mkdirSync(dir);
        }
    }
}
