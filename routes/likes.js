const express = require('express');
const router = express.Router();
const { Course, Like, User } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFoundError } = require('../utils/errors');

/**
 * 查询用户点赞的课程
 * GET /likes
 */
router.get('/', async function (req, res) {
    try {
      const query = req.query;
      const currentPage = Math.abs(Number(query.currentPage)) || 1;
      const pageSize = Math.abs(Number(query.pageSize)) || 10;
      const offset = (currentPage - 1) * pageSize;
  
      // 查询当前用户
      const user = await User.findByPk(req.userId);
  
      // 查询当前用户点赞过的课程
      const courses = await user.getLikeCourses({
        joinTableAttributes: [],
        attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
        order: [['id', 'DESC']],
        limit: pageSize,
        offset: offset
      });
  
      // 查询当前用户点赞过的课程总数
      const count = await user.countLikeCourses();
  
      success(res, '查询用户点赞的课程成功。', {
        courses,
        pagination: {
          total: count,
          currentPage,
          pageSize,
        }
      })
    } catch (error) {
      failure(res, error);
    }
  });
  
  
module.exports = router;
