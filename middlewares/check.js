module.exports = {
    checkLogin: (req, res, next) => {
        if (!req.session.user) {
            req.flash('error', '未登录');
            return res.ridrect('/signin');
        }
        next();
    },
    checkNotLogin: (req, res, next) => {
        if (req.session.user) {
            req.flash('error', '已登录');
            console.log('已经好了');
            return res.redirect('back');
        }
        next();
    }
}