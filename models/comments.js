const marked = require('marked');
const Comment = require('../lib/mongo').Comment;

Comment.plugin('contentToHtml', {
    afterFind: (comments) => {
        return comments.map((comment) => {
            comment.content = marked(comment.content);
            return comment;
        })
    }
})

module.exports = {
    // 创建留言
    create: function create(comment) {
        return Comment.create(comment).exec();
    },
    getCommentById: function getCommentById(commentId) {
        return Comment.findOne({ _id: commentId }).exec()
    },
    delCommentById: function delCommentById(commentId) {
        return Comment.deleteOne({ _id: commentId }).exec()
    },
    delCommentsByPostId: function delCommentsByPostId(postId) {
        return Comment.deleteMany({ postId: postId }).exec()
    },
    getComments: function getComments(postId) {
        return Comment
            .find({ postId: postId })
            .populate({ path: 'author', model: 'User' })
            .sort({ _id: 1 })
            .addCreatedAt()
            .contentToHtml()
            .exec()
    },
    getCommentsCount: function getCommentsCount(postId) {
        return Comment.count({ postId: postId }).exec()
    }
}