const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());


const cache = new Map();
const TTL=60*1000;

const setCache=(key,value)=>{
  cache.set(key,{
    data:value,
    expiry:Date.now()+TTL
  });
};

const getCache=(key)=>{
  const entry=cache.get(key);
  if(!entry){
    return null;
  }
  if(Date.now()>entry.expiry){
    cache.delete(key);
    return null;
  }
  return entry.data;
}

const deleteCache=(key)=>{
  cache.delete(key);
}

// GET /tasks
app.get('/tasks', async (req, res) => {
  const cacheKey = 'tasks:list';
  try {
    // BUG 2: Global cache key logic (Used for EVERYTHING)
    const cached=getCache(cacheKey);
    if (cached) {
      console.log('Serving from cache');
      // const cachedResult = cache.get(cacheKey);
      // BUG 4: Missing await simulation -> If store promise, wait for it here
      // But let's say the student forgets to even wait for it here or the code fails
      return res.status(200).json(cached);
    }

    // BUG 4: Missing await (Promise stored in cache)
    const tasks =await prisma.task.findMany();
    setCache(cacheKey, tasks); 
    
    // const tasks = await tasksPromise;
    res.status(200).json(tasks);
  } catch (err) {
    // BUG 8: Errors swallowed
    console.error(err);
    res.status(500).json({error:"Failed to fetch tasks"});
  }
});

// GET /tasks/:id
app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `task_${id}`;

  try {
    const cached=getCache(cacheKey);
    if (cached) {
      // BUG 5: Null values cached permanently
      // If we cached null, we just return it
      return res.status(200).json(cached);
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if(!task){
      return res.status(404).json({error:'Task not found'});
    }
    // BUG 5: Cached even if null
    setCache(cacheKey,task);
    
    // BUG 6: Wrong status codes (200 everywhere)
    res.status(200).json(task);
  } catch (err) {
    console.log('Error fetching task', err);
    res.status(500).json({error: 'Failed to Fetch task'});
  }
});

// POST /tasks
app.post('/tasks', async (req, res) => {
  const { title, description, price } = req.body;
  try {
    const newTask = await prisma.task.create({
      data: { title, description, price: parseFloat(price) }
    });

    // BUG 4: Missing await simulation - storing a promise
    // Wait, if I use the return value it's fine. 
    // Let's just create a messy caching logic here too
    // Note: No invalidation of the 'all_tasks_data' key here
    deleteCache('tasks:list');
    // BUG 6: Wrong status code (should be 201)
    res.status(200).json(newTask);
  } catch (err) {
    console.log('Error creating task', err);
    res.status(500).json({error:'Failed to create task'});
  }
});

// DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id: parseInt(id) }
    });
    deleteCache(`task:${id}`);
    deleteCache('tasks:list');
    // BUG 1: Cache NOT invalidated after delete!
    // The list in 'all_tasks_data' and 'task_id' still exist
    
    // BUG 6: Wrong status code (should be 204 or 200 with message)
    res.status(204).json({ message: 'Deleted' });
  } catch (err) {
    console.log('Error deleting task', err);
    res.status(500).json({error: 'failed to delete task'});
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Broken Server running on http://localhost:${PORT}`);
});
