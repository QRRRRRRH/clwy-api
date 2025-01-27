const express = require('express');
const router = express.Router();
const { Course, Category, User,Chapter } = require('../../models');

const { Op } = require('sequelize');
// 当前是第几页，如果不传，那就是第一页
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


/**
 * 查询课程列表
 * GET /admin/courses
 */
router.get('/', async function (req, res) {
    try {
      // 获取查询参数
      const query = req.query;
  
      // 获取分页所需要的两个参数，currentPage 和 pageSize
      // 如果没有传递这两个参数，就使用默认值
      // 默认是第1页
      // 默认每页显示 10 条数据
      const currentPage = Math.abs(Number(query.currentPage)) || 1;
      const pageSize = Math.abs(Number(query.pageSize)) || 10;
  
      // 计算offset
      const offset = (currentPage - 1) * pageSize;
  
      // 定义查询条件
      const condition = {
       ...getCondition(),
        order: [['id', 'DESC']],
        limit: pageSize,
        offset: offset
      
      };
  
      if (query.categoryId) {
        condition.where = {
          categoryId: {
            [Op.eq]: query.categoryId
          }
        };
      }
      
      if (query.userId) {
        condition.where = {
          userId: {
            [Op.eq]: query.userId
          }
        };
      }
      
      if (query.name) {
        condition.where = {
          name: {
            [Op.like]: `%${ query.name }%`
          }
        };
      }
      
      if (query.recommended) {
        condition.where = {
          recommended: {
            // 需要转布尔值
            [Op.eq]: query.recommended === 'true'
          }
        };
      }
      
      if (query.introductory) {
        condition.where = {
          introductory: {
            [Op.eq]: query.introductory === 'true'
          }
        };
      }
      
  
      // 查询数据
      // 将 findAll 方法改为 findAndCountAll 方法
      // findAndCountAll 方法会返回一个对象，对象中有两个属性，一个是 count，一个是 rows，
      // count 是查询到的数据的总数，rows 中才是查询到的数据
      const { count, rows } = await Course.findAndCountAll(condition);
  
      // 返回查询结果
      success(res, '查询课程列表成功。', {
        courses: rows,
        pagination: {
          total: count,
          currentPage,
          pageSize,
        }
      });
    } catch (error) {
      failure(res, error);
    }
  });
  

 
  router.get('/:id', async function (req, res) {
   try { 
    const course = await getCourse(req);
  
    success(res, '查询课程成功。', { course });

}
    catch(error){
      failure(res, error);
    }
  });

/**
 * 创建课程
 * POST /admin/courses
 */
router.post('/', async function (req, res) {
    try {
      // 白名单过滤
      const body = filterBody(req);
  
      // 使用过滤好的 body 数据，创建课程
      const course = await Course.create(body);
  
      success(res, '创建课程成功。', { course }, 201);
    } catch (error) {
      failure(res, error);
      
    }
  });
  
  router.delete('/:id', async function (req, res) {
    try {
      const course = await getCourse(req);
  
      const count = await Chapter.count({ where: { courseId: req.params.id } });
      if (count > 0) {
        throw new Error('当前课程有章节，无法删除。');
      }
  
      await course.destroy();
      success(res, '删除课程成功。');
    } catch (error) {
      failure(res, error);
    }
  });
/**
 * 公共方法：关联分类、用户数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
  return {
    attributes: { exclude: ['CategoryId', 'UserId'] },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar']
      }
    ]
  }
}



  router.put('/:id', async function (req, res) {
    try {
      const course = await getCourse(req);
    const body = filterBody(req);
  

        await course.update(body);
  
        success(res, '创建课程成功。', { course }, 201);
     
    } catch (error) {
      failure(res, error);
    }
  });

  router.get('/', async function (req, res) {
    try {
      // 获取查询参数
      const query = req.query;
  
      // 定义查询条件
      const condition = {
        order: [['id', 'DESC']]
      };
  
      // 如果有 title 查询参数，就添加到 where 条件中
      if(query.title) {
        condition.where = {
          title: {
            [Op.like]: `%${query.title}%`
          }
        };
      }
  
      // 查询数据
      const courses = await Course.findAll(condition);
  
      // 返回查询结果
      res.json({
        status: true,
        message: '查询课程列表成功。',
        data: {
          courses
        }
      });
    } catch (error) {
      failure(res, error);
    }
  });
  /**
 * 公共方法：查询当前课程
 */
async function getCourse(req) {
  // 获取课程 ID
 const { id } = req.params;
 const condition =getCondition();
  // 查询当前课程
 const course = await Course.findByPk(id);

 // 如果没有找到，就抛出异常
 if (!course) {
   throw new NotFoundError(`ID: ${ id }的课程未找到。`)
 }

 return course;
}
/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{image: *, name, introductory: (boolean|*), userId: (number|*), categoryId: (number|*), content, recommended: (boolean|*)}}
 */
function filterBody(req) {
  return {
    categoryId: req.body.categoryId,
    userId: req.body.userId,
    name: req.body.name,
    image: req.body.image,
    recommended: req.body.recommended,
    introductory: req.body.introductory,
    content: req.body.content
  };
}

module.exports = router;
