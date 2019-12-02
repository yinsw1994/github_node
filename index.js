const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const config = require('config-lite')(__dirname);
const routes = require('./routes');
const pkg = require('./package');

// 日志
const winston = require('winston');
const expressWinston = require('express-winston');

const app = express();

// 设置模版目录
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 静态目录
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({
    name: config.session.key,
    secret: config.session.secret,
    resave: true, //强制更新 session
    saveUninitialized: false,
    cookie: {
        maxAge: config.session.maxAge
    },
    store: new MongoStore({
        url: config.mongodb
    })
}))

app.use(flash());

app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'),
    keepExtensions: true
}))

app.locals.blog = {
    title: pkg.name,
    description: pkg.description
}

/**
 * 添加模版必须的三个变量
 */
app.use((req, res, next) => {
    res.locals.user = req.session.user
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
})

app.use(expressWinston.logger({
    transports: [
        new (winston.transports.Console) ({
            json: true,
            colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}))

routes(app);

app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}))

app.use(function (err, req, res, next) {
    console.error(err)
    req.flash('error', err.message)
    res.redirect('/posts')
})

app.listen(config.port, () => {
    console.log(`${pkg.name} listenging on port ${config.port}`)
})