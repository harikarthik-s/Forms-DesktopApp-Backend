import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;
const dbFilePath = path.join(__dirname, 'db.json');

app.use(bodyParser.json());

app.use((req, res, next) => {
    if (req.method === 'DELETE') {
        bodyParser.json()(req, res, next);
    } else {
        next();
    }
});

app.get('/ping', (req, res) => {
    res.json(true);
});

app.post('/submit', (req, res) => {
    const { name, email, phone, github_link, stopwatch_time } = req.body;
    const submissions = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));

    submissions.push({ name, email, phone, github_link, stopwatch_time });
    fs.writeFileSync(dbFilePath, JSON.stringify(submissions, null, 2));

    res.status(201).send('Submission saved');
});

app.get('/read', (req, res) => {
    const index = parseInt(req.query.index as string, 10);
    const submissions = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));

    if (index >= 0 && index < submissions.length) {
        res.json(submissions[index]);
    } else {
        res.status(404).json({});
    }
});


app.delete('/delete', (req, res) => {
    const index = parseInt(req.body.index, 10);
    const submissions = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));

    if (index >= 0 && index < submissions.length) {
        submissions.splice(index, 1);
        fs.writeFileSync(dbFilePath, JSON.stringify(submissions, null, 2));

        res.status(200).send('Submission deleted');
    } else {
        res.status(404).send('Submission not found');
    }
});

app.put('/edit', (req, res) => {
    const index = parseInt(req.body.index, 10);
    const { name, email, phone, github_link, stopwatch_time } = req.body;
    const submissions = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));

    if (index >= 0 && index < submissions.length) {
        submissions[index] = { name, email, phone, github_link, stopwatch_time };
        fs.writeFileSync(dbFilePath, JSON.stringify(submissions, null, 2));

        res.status(200).send('Submission updated');
    } else {
        res.status(404).send('Submission not found');
    }
});

interface Submission {
    name: string;
    email: string;
    phone: string;
    github_link: string;
    stopwatch_time: number;
}

app.get('/search', (req, res) => {
    const email = req.query.email as string;
    const submissions = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
    const results = submissions.filter((submission: Submission) => submission.email === email);

res.json(results);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
