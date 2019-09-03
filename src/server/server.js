import path from 'path'
import express from 'express'

const app = express()

import head from 'raw-loader!../partials/head.html';
import nav from 'raw-loader!../partials/nav.html';
import foot from 'raw-loader!../partials/foot.html';

// app.use(express.static(DIST_DIR))

app.get('*', (req, res) => {
    res.write(head + nav)
    res.write('Testing "stream"')
    res.write(foot)
    res.end();
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`App listening to ${PORT}....`)
    console.log('Press Ctrl+C to quit.')
})
