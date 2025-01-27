const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { Op } = require('sequelize');
// 当前是第几页，如果不传，那就是第一页
const {
  NotFoundError,
  success,
  failure,
} = require('../../utils/response');

/**
 * 查询 用户列表
 * GET /admin/users
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
  
      // 如果有 title 查询参数，就添加到 where 条件中
      if (query.email) {
        condition.where = {
          email: {
            [Op.eq]: query.email
          }
        };
      }
      
      if (query.username) {
        condition.where = {
          username: {
            [Op.eq]: query.username
          }
        };
      }
      
      if (query.nickname) {
        condition.where = {
          nickname: {
            [Op.like]: `%${ query.nickname }%`
          }
        };
      }
      
      if (query.role) {
        condition.where = {
          role: {
            [Op.eq]: query.role
          }
        };
      }
      
  
      // 查询数据
      // 将 findAll 方法改为 findAndCountAll 方法
      // findAndCountAll 方法会返回一个对象，对象中有两个属性，一个是 count，一个是 rows，
      // count 是查询到的数据的总数，rows 中才是查询到的数据
      const { count, rows } = await User.findAndCountAll(condition);
  
      // 返回查询结果
      success(res, '查询 用户列表成功。', {
        users: rows,
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
    const user = await getUser(req);
  
    success(res, '查询 用户成功。', { user });

}
    catch(error){
      failure(res, error);
    }
  });

/**
 * 创建 用户
 * POST /admin/users
 */
router.post('/', async function (req, res) {
    try {
      // 白名单过滤
      const body = filterBody(req);
  
      // 使用过滤好的 body 数据，创建 用户
      const user = await User.create(body);
  
      success(res, '创建 用户成功。', { user }, 201);
    } catch (error) {
      failure(res, error);
      
    }
  });
  
  router.delete('/:id', async function (req, res) {
    try {
      // 获取 用户 ID
      const user = await getUser(req);
     
        // 删除 用户
        await user.destroy();
        success(res, '删除 用户成功。');
     
    } catch (error) {
      failure(res, error);
    }
  });
  router.put('/:id', async function (req, res) {
    try {
      const user = await getUser(req);
    const body = filterBody(req);
  

        await user.update(body);
  
        success(res, '创建 用户成功。', { user }, 201);
     
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
      const users = await User.findAll(condition);
  
      // 返回查询结果
      res.json({
        status: true,
        message: '查询 用户列表成功。',
        data: {
          users
        }
      });
    } catch (error) {
      failure(res, error);
    }
  });
  /**
 * 公共方法：查询当前 用户
 */
async function getUser(req) {
  // 获取 用户 ID
 const { id } = req.params;

  // 查询当前 用户
 const user = await User.findByPk(id);

 // 如果没有找到，就抛出异常
 if (!user) {
   throw new NotFoundError(`ID: ${ id }的 用户未找到。`)
 }

 return user;
}

  /**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{title, content: (string|string|DocumentFragment|*)}}
 */
  function filterBody(req) {
    return {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      nickname: req.body.nickname,
      sex: req.body.sex,
      company: req.body.company,
      introduce: req.body.introduce,
      role: req.body.role,
      avatar: req.body.avatar
    };
  }
  
module.exports = router;
