const express = require('express');
const router = express.Router();
const { Category} = require('../../models');
const { Op } = require('sequelize');
// 当前是第几页，如果不传，那就是第一页
const {
  NotFoundError,
  success,
  failure,
} = require('../../utils/response');

/**
 * 查询分类列表
 * GET /admin/categories
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
        order: [['id', 'DESC']],
  
        // 在查询条件中添加 limit 和 offset
        limit: pageSize,
        offset: offset
      };
  
      // 如果有 name查询参数，就添加到 where 条件中
      if (query.name) {
        condition.where = {
          name: {
            [Op.like]: `%${query.name}%`
          }
        };
      }
  
      // 查询数据
      // 将 findAll 方法改为 findAndCountAll 方法
      // findAndCountAll 方法会返回一个对象，对象中有两个属性，一个是 count，一个是 rows，
      // count 是查询到的数据的总数，rows 中才是查询到的数据
      const { count, rows } = await Category.findAndCountAll(condition);
  
      // 返回查询结果
      success(res, '查询分类列表成功。', {
        categories: rows,
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
    const category= await getCategory(req);
  
    success(res, '查询分类成功。', { category});

}
    catch(error){
      failure(res, error);
    }
  });

/**
 * 创建分类
 * POST /admin/categories
 */
router.post('/', async function (req, res) {
    try {
      // 白名单过滤
      const body = filterBody(req);
  
      // 使用过滤好的 body 数据，创建分类
      const category= await Category.create(body);
  
      success(res, '创建分类成功。', { category}, 201);
    } catch (error) {
      failure(res, error);
      
    }
  });
  
  router.delete('/:id', async function (req, res) {
    try {
      // 获取分类 ID
      const category= await getCategory(req);
     
        // 删除分类
        await category.destroy();
        success(res, '删除分类成功。');
     
    } catch (error) {
      failure(res, error);
    }
  });
  router.put('/:id', async function (req, res) {
    try {
      const category= await getCategory(req);
    const body = filterBody(req);
  

        await category.update(body);
  
        success(res, '创建分类成功。', { category}, 201);
     
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
  
      // 如果有 name查询参数，就添加到 where 条件中
      if(query.name) {
        condition.where = {
          name: {
            [Op.like]: `%${query.name}%`
          }
        };
      }
  
      // 查询数据
      const categories= await Category.findAll(condition);
  
      // 返回查询结果
      res.json({
        status: true,
        message: '查询分类列表成功。',
        data: {
          categories
        }
      });
    } catch (error) {
      failure(res, error);
    }
  });
  /**
 * 公共方法：查询当前分类
 */
async function getCategory(req) {
  // 获取分类 ID
 const { id } = req.params;

  // 查询当前分类
 const category= await Category.findByPk(id);

 // 如果没有找到，就抛出异常
 if (!category) {
   throw new NotFoundError(`ID: ${ id }的分类未找到。`)
 }

 return category;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{name, rank: *}}
 */

function filterBody(req) {
    return {
      name: req.body.name,
      rank: req.body.rank
    };
  }
  
  
module.exports = router;
