const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminCategoriesRouter = require('./routes/admin/categories');
const adminSettingsRouter = require('./routes/admin/settings');

const adminUsersRouter = require('./routes/admin/users');
const adminCoursesRouter = require('./routes/admin/courses');
const adminChaptersRouter = require('./routes/admin/chapters');


const app = express();
// 后台路由文件
const adminArticlesRouter = require('./routes/admin/articles');
app.use('/admin/settings', adminSettingsRouter);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// 后台路由配置
app.use('/admin/articles', adminArticlesRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin/categories', adminCategoriesRouter);
app.use('/admin/users', adminUsersRouter);
app.use('/admin/courses', adminCoursesRouter);
app.use('/admin/chapters', adminChaptersRouter);





module.exports = app;
