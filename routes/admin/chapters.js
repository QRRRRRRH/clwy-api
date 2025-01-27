const express = require('express');
const router = express.Router();
const { Chapter,Course } = require('../../models');
const { Op } = require('sequelize');
// 当前是第几页，如果不传，那就是第一页
const {
  NotFoundError,
  success,
  failure,
} = require('../../utils/response');

/**
 * 查询章节列表
 * GET /admin/chapters
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
  
      if (!query.courseId) {
        throw new Error('获取章节列表失败，课程ID不能为空。');
      }
      
      const condition = {
        ...getCondition(),
        order: [['rank', 'ASC'], ['id', 'ASC']],

        limit: pageSize,
        offset: offset
      };
      
      condition.where = {
        courseId: {
          [Op.eq]: query.courseId
        }
      };
      
      if (query.title) {
        condition.where = {
          title: {
            [Op.like]: `%${ query.title }%`
          }
        };
      }
      
  
      // 查询数据
      // 将 findAll 方法改为 findAndCountAll 方法
      // findAndCountAll 方法会返回一个对象，对象中有两个属性，一个是 count，一个是 rows，
      // count 是查询到的数据的总数，rows 中才是查询到的数据
      const { count, rows } = await Chapter.findAndCountAll(condition);
  
      // 返回查询结果
      success(res, '查询章节列表成功。', {
        chapters: rows,
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
    const chapter = await getChapter(req);
  
    success(res, '查询章节成功。', { chapter });

}
    catch(error){
      failure(res, error);
    }
  });

/**
 * 创建章节
 * POST /admin/chapters
 */
router.post('/', async function (req, res) {
    try {
      // 白名单过滤
      const body = filterBody(req);
  
      // 使用过滤好的 body 数据，创建章节
      const chapter = await Chapter.create(body);
  
      success(res, '创建章节成功。', { chapter }, 201);
    } catch (error) {
      failure(res, error);
      
    }
  });
  
  router.delete('/:id', async function (req, res) {
    try {
      // 获取章节 ID
      const chapter = await getChapter(req);
     
        // 删除章节
        await chapter.destroy();
        success(res, '删除章节成功。');
     
    } catch (error) {
      failure(res, error);
    }
  });
  /**
 * 公共方法：关联课程数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
  return {
    attributes: { exclude: ['CourseId'] },
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'name']
      }
    ]
  }
}

  router.put('/:id', async function (req, res) {
    try {
      const chapter = await getChapter(req);
    const body = filterBody(req);
  

        await chapter.update(body);
  
        success(res, '创建章节成功。', { chapter }, 201);
     
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
      const chapters = await Chapter.findAll(condition);
  
      // 返回查询结果
      res.json({
        status: true,
        message: '查询章节列表成功。',
        data: {
          chapters
        }
      });
    } catch (error) {
      failure(res, error);
    }
  });
  /**
 * 公共方法：查询当前章节
 */
async function getChapter(req) {
  // 获取章节 ID
 const { id } = req.params;
 const condition = getCondition();
  // 查询当前章节
 const chapter = await Chapter.findByPk(id);

 // 如果没有找到，就抛出异常
 if (!chapter) {
   throw new NotFoundError(`ID: ${ id }的章节未找到。`)
 }

 return chapter;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{rank: (number|*), video: (string|boolean|MediaTrackConstraints|VideoConfiguration|*), title, courseId: (number|*), content}}
 */
function filterBody(req) {
  return {
    courseId: req.body.courseId,
    title: req.body.title,
    content: req.body.content,
    video: req.body.video,
    rank: req.body.rank
  };
}

  
  
module.exports = router;
