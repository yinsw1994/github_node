const fs = require('fs');
const path = require('path');
const sha1 = require('sha1');
const express = require('express');
const router = express.Router();

const UserModel = require('../models/user');
const checkNotLogin = require('../middlewares/check').checkNotLogin;


router.get('/', checkNotLogin, (req, res, next) => {
    res.render('signup')
})

router.post('/', checkNotLogin, (req, res, next) => {
    const name = req.fields.name;
    const gender = req.fields.gender;
    const bio = req.fields.bio;
    const avatar = req.files.avatar.path.split(path.sep).pop();
    let password = req.fields.password;
    const repassword = req.fields.repassword;

    try {
        if (!(name.length >= 1 && name.length <= 15)) {
            throw new Error('名字请限制在 1-10 个字符')
        }

        if (['m', 'f', 'x'].indexOf(gender) === -1) {
            throw new Error('性别只能是m、f 或 x');
        }

        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error('个人简介请限制在1-30个字符')
        }

        if (!req.files.avatar.name) {
            throw new Error('缺少头像')
        }

        if (password.length < 6) {
            throw new Error('密码至少6个字符')
        }

        if (password !== repassword) {
            throw new Error('两次密码输入不一致')
        }
    } catch (e) {
        fs.unlink(req.files.avatar.path);
        req.flash('error', e.message);
        return res.redirect('/signup')
    }

    password = sha1(password);

    let user = {
        name: name,
        password: password,
        gender: gender,
        bio: bio,
        avatar: avatar
    }

    // 写入数据库
    UserModel.create(user).then((result) => {
        user = result.ops[0];
        delete user.password;
        req.session.user = user;
        req.flash('success', '注册成功');
        res.redirect('/posts');
    })
    .catch((e) => {
        fs.unlink(req.files.avatar.path)
        if (e.message.match('duplicate key')) {
            req.flash('error', '用户名已被占用');
            return res.redirect('/signup');
        }
        next(e);
    })

})

module.exports = router;