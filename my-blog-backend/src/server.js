import fs from 'fs';
import admin from 'firebase-admin';
import express from 'express';
import { db, connectToDb } from './db.js';

// Initialize Firebase Admin SDK with credentials
const credentials = JSON.parse(
    fs.readFileSync('./credentials.json')
);
admin.initializeApp({
    credential: admin.credential.cert(credentials),
});

const app = express();
app.use(express.json());

// Middleware to handle user authentication using Firebase tokens
app.use(async (req, res, next) => {
    const { authtoken } = req.headers;

    if (authtoken) {
        try {
            req.user = await admin.auth().verifyIdToken(authtoken);
        } catch (e) {
            console.error('Error verifying auth token:', e); // Log any errors with token verification
            return res.sendStatus(400);
        }
    }

    req.user = req.user || {};  // Set default user to empty object if no auth token
    next();
});

// Route to get article details and upvote status
app.get('/api/articles/:name', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    try {
        const article = await db.collection('articles').findOne({ name });

        if (article) {
            const upvoteIds = article.upvoteIds || [];
            // Check if the user can upvote
            const canUpvote = uid && !upvoteIds.includes(uid);
            res.json({ ...article, canUpvote });
        } else {
            res.sendStatus(404);  // Article not found
        }
    } catch (error) {
        console.error('Error fetching article:', error);
        res.sendStatus(500);  // Server error
    }
});


// Middleware to check if the user is authenticated
app.use((req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);  // Unauthorized if no user is found
    }
});

// Route to handle upvoting articles
app.put('/api/articles/:name/upvote', async (req, res) => {
    const { name } = req.params;
    const { uid } = req.user;

    try {
        const article = await db.collection('articles').findOne({ name });

        if (article) {
            const upvoteIds = article.upvoteIds || [];
            const canUpvote = uid && !upvoteIds.includes(uid);

            if (canUpvote) {
                await db.collection('articles').updateOne({ name }, {
                    $inc: { upvotes: 1 },
                    $push: { upvoteIds: uid },
                });
            }

            const updatedArticle = await db.collection('articles').findOne({ name });
            const updatedCanUpvote = uid && !updatedArticle.upvoteIds.includes(uid);

            // Return the updated article info with the correct canUpvote field
            res.json({ ...updatedArticle, canUpvote: updatedCanUpvote });
        } else {
            res.send('That article doesn\'t exist');
        }
    } catch (error) {
        console.error('Error upvoting article:', error);
        res.sendStatus(500);
    }
});
// Route to handle adding comments to articles
app.post('/api/articles/:name/comments', async (req, res) => {
    const { name } = req.params;
    const { text } = req.body;
    const { email } = req.user;

    // Log data for debugging
    console.log('User Email:', email);
    console.log('Comment Text:', text);

    if (!email || !text) {
        return res.status(400).send('Missing email or comment text');  // Validate input
    }

    try {
        await db.collection('articles').updateOne({ name }, {
            $push: { comments: { postedBy: email, text } },
        });

        const article = await db.collection('articles').findOne({ name });

        if (article) {
            res.json(article);  // Send the updated article back as a response
        } else {
            res.status(404).send('That article doesn\'t exist!');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        res.sendStatus(500);  // Server error status on failure
    }
});

// Connect to the database and start the server
connectToDb(() => {
    console.log('Successfully connected to database!');
    app.listen(8000, () => {
        console.log('Server is listening on port 8000');
    });
});
