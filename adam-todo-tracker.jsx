import React, { useState, useEffect } from 'react';
import { Trash2, Plus, CheckCircle, Circle, Zap } from 'lucide-react';

export default function TodoTracker() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('content');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = [
    { id: 'content', label: 'Content Creation', color: 'from-pink-500 to-rose-500' },
    { id: 'research', label: 'Research', color: 'from-blue-500 to-cyan-500' },
    { id: 'editing', label: 'Editing', color: 'from-purple-500 to-indigo-500' },
    { id: 'social', label: 'Social Media', color: 'from-orange-500 to-amber-500' },
    { id: 'admin', label: 'Admin', color: 'from-slate-500 to-gray-500' },
  ];

  // Load tasks from storage on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const result = await window.storage?.get(`tasks-${date}`);
        if (result?.value) {
          setTasks(JSON.parse(result.value));
        } else {
          setTasks([]);
        }
      } catch (err) {
        console.log('Starting fresh for today');
        setTasks([]);
      }
    };
    loadTasks();
  }, [date]);

  // Save tasks to storage whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await window.storage?.set(`tasks-${date}`, JSON.stringify(tasks));
      } catch (err) {
        console.error('Error saving tasks:', err);
      }
    };
    saveTasks();
  }, [tasks, date]);

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask,
        category,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, task]);
      setNewTask('');
      setCategory('content');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const groupedTasks = categories.reduce((acc, cat) => {
    acc[cat.id] = tasks.filter(t => t.category === cat.id);
    return acc;
  }, {});

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  const getCategoryColor = (catId) => {
    return categories.find(c => c.id === catId)?.color || 'from-gray-500 to-gray-500';
  };

  const getCategoryLabel = (catId) => {
    return categories.find(c => c.id === catId)?.label || catId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-pink-400" />
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
              Adam Content
            </h1>
          </div>

          <div className="flex items-center justify-between">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-pink-500/50 transition-colors"
            />
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">Progress</div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-lg font-bold text-pink-400">{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        <div className="mb-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="What needs to be done today?"
              className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 transition-colors"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-pink-500/50 transition-colors"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <button
              onClick={addTask}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>

        {/* Tasks by Category */}
        <div className="space-y-6">
          {categories.map(cat => {
            const catTasks = groupedTasks[cat.id];
            if (catTasks.length === 0) return null;

            const completedInCat = catTasks.filter(t => t.completed).length;

            return (
              <div key={cat.id} className="group">
                <div className={`bg-gradient-to-r ${cat.color} p-px rounded-lg mb-3 opacity-60 group-hover:opacity-100 transition-opacity`}>
                  <div className="bg-slate-900 rounded-[7px] px-4 py-3 flex items-center justify-between">
                    <div>
                      <h2 className={`text-lg font-bold bg-gradient-to-r ${cat.color} bg-clip-text text-transparent`}>
                        {cat.label}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        {completedInCat} of {catTasks.length} completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center">
                        <span className={`text-lg font-bold bg-gradient-to-r ${cat.color} bg-clip-text text-transparent`}>
                          {catTasks.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 ml-2">
                  {catTasks.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 ${
                        task.completed
                          ? 'bg-slate-800/20 border border-slate-700/30'
                          : 'bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60'
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-1 flex-shrink-0 focus:outline-none transition-all duration-200"
                      >
                        {task.completed ? (
                          <CheckCircle className="w-6 h-6 text-pink-400 drop-shadow-lg" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-600 hover:text-slate-500 transition-colors" />
                        )}
                      </button>
                      <span
                        className={`flex-1 py-1 transition-all duration-200 ${
                          task.completed
                            ? 'text-slate-500 line-through'
                            : 'text-slate-200'
                        }`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="flex-shrink-0 p-1 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No tasks yet. Add one to get started! ✨</p>
          </div>
        )}

        {/* Completion Celebration */}
        {tasks.length > 0 && completedCount === tasks.length && tasks.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-xl text-center">
            <p className="text-2xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              🎉 All tasks complete! Amazing work! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
}