import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NotFoundPage from './NotFoundPage';
import CommentsList from '../components/CommentsList';
import AddCommentForm from '../components/AddCommentForm';
import useUser from '../hooks/useUser';
import articles from './article-content';

const ArticlePage = () => {
    const [articleInfo, setArticleInfo] = useState({ upvotes: 0, comments: [], canUpvote: false });
    const { canUpvote } = articleInfo;
    const { articleId } = useParams();
    const { user, isLoading } = useUser();

    // Use effect to load article information
    useEffect(() => {
        const loadArticleInfo = async () => {
            try {
                const token = user && await user.getIdToken();
                const headers = token ? { authtoken: token } : {};
                const response = await axios.get(`/api/articles/${articleId}`, { headers });
                const newArticleInfo = response.data;
                setArticleInfo(newArticleInfo);
            } catch (error) {
                console.error('Error loading article info:', error);
            }
        };

        if (!isLoading && user) {
            loadArticleInfo();
        }
    }, [isLoading, user, articleId]);

    // Find the article based on the articleId
    const article = articles.find(article => article.name === articleId);

    // Function to add upvote
    const addUpvote = async () => {
        try {
            const token = user && await user.getIdToken();
            const headers = token ? { authtoken: token } : {};
            const response = await axios.put(`/api/articles/${articleId}/upvote`, null, { headers });
            const updatedArticle = response.data;
            setArticleInfo(updatedArticle);
        } catch (error) {
            console.error('Error adding upvote:', error);
        }
    };

    if (!article) {
        return <NotFoundPage />;
    }

    return (
        <>
            <h1>{article.title}</h1>
            <div className="upvotes-section">
                {user
                    ? <button onClick={addUpvote} disabled={!canUpvote}>
                        {canUpvote ? 'Upvote' : 'Already Upvoted'}
                      </button>
                    : <button>Log in to upvote</button>}
                <p>This article has {articleInfo.upvotes} upvote(s)</p>
            </div>
            {article.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
            {user
                ? <AddCommentForm
                    articleName={articleId}
                    onArticleUpdated={updatedArticle => setArticleInfo(updatedArticle)} />
                : <button>Log in to add a comment</button>}
            <CommentsList comments={articleInfo.comments} />
        </>
    );
}

export default ArticlePage;
