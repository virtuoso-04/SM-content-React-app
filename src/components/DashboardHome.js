import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaRobot, 
  FaInstagram, 
  FaHashtag, 
  FaLightbulb, 
  FaPen, 
  FaFileAlt,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaImage
} from 'react-icons/fa';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    postsGenerated: 0,
    ideasCreated: 0,
    contentRefined: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    // Load from localStorage
    const stored = {
      postsGenerated: parseInt(localStorage.getItem('stats_posts') || '0'),
      ideasCreated: parseInt(localStorage.getItem('stats_ideas') || '0'),
      contentRefined: parseInt(localStorage.getItem('stats_refined') || '0')
    };
    setStats(stored);
  };

  const tools = [
    {
      id: 'chatbot',
      title: 'AI Assistant',
      description: 'Chat naturally to create any content you need',
      icon: FaRobot,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      path: '/dashboard/chatbot',
      size: 'large', // Takes 2 columns
      features: [
        'Natural conversation AI',
        'Instagram posts with images',
        'Hashtags & captions',
        'Content ideas & summaries',
        'Post directly to Instagram'
      ]
    },
    {
      id: 'image-generator',
      title: 'Image Studio',
      description: 'Create AI visuals instantly',
      icon: FaImage,
      gradient: 'from-purple-500 via-pink-500 to-amber-500',
      bgGradient: 'from-purple-50 to-amber-50',
      path: '/dashboard/image-generator',
      size: 'small',
      features: [
        'Pollinations/Picsum routing',
        'Download-ready links'
      ]
    },
    {
      id: 'summarizer',
      title: 'Content Summarizer',
      description: 'Condense long text into key points',
      icon: FaFileAlt,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      path: '/dashboard/summarizer',
      size: 'small',
      features: [
        'Quick summaries',
        'Key point extraction'
      ]
    },
    {
      id: 'ideas',
      title: 'Idea Generator',
      description: 'Brainstorm creative content concepts',
      icon: FaLightbulb,
      gradient: 'from-amber-500 to-yellow-500',
      bgGradient: 'from-amber-50 to-yellow-50',
      path: '/dashboard/idea-generator',
      size: 'small',
      features: [
        'Creative brainstorming',
        'Multiple ideas at once'
      ]
    },
    {
      id: 'refiner',
      title: 'Content Refiner',
      description: 'Polish and improve your text with AI',
      icon: FaPen,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50',
      path: '/dashboard/content-refiner',
      size: 'small',
      features: [
        'Grammar & style fixes',
        'Tone adjustment'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Create Instagram Post',
      icon: FaInstagram,
      action: () => navigate('/dashboard/chatbot'),
      prompt: 'Create an Instagram post about...'
    },
    {
      title: 'Generate Concept Art',
      icon: FaImage,
      action: () => navigate('/dashboard/image-generator'),
      prompt: 'Generate an image showing...'
    },
    {
      title: 'Generate Hashtags',
      icon: FaHashtag,
      action: () => navigate('/dashboard/chatbot'),
      prompt: 'Generate hashtags for...'
    },
    {
      title: 'Get Content Ideas',
      icon: FaLightbulb,
      action: () => navigate('/dashboard/chatbot'),
      prompt: 'Give me ideas about...'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 text-lg font-medium">
          What would you like to create today?
        </p>
      </div>

      {/* Stats Cards - Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-strong rounded-2xl p-5 border-2 border-emerald-200/50 apple-shadow-lg hover:apple-shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
              <FaInstagram className="text-emerald-600 text-xl" />
            </div>
            <FaChartLine className="text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{stats.postsGenerated}</p>
            <p className="text-sm text-gray-600 font-semibold">Posts Created</p>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-5 border-2 border-amber-200/50 apple-shadow-lg hover:apple-shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100">
              <FaLightbulb className="text-amber-600 text-xl" />
            </div>
            <FaChartLine className="text-amber-400 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{stats.ideasCreated}</p>
            <p className="text-sm text-gray-600 font-semibold">Ideas Generated</p>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-5 border-2 border-violet-200/50 apple-shadow-lg hover:apple-shadow-xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100">
              <FaPen className="text-violet-600 text-xl" />
            </div>
            <FaChartLine className="text-violet-400 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{stats.contentRefined}</p>
            <p className="text-sm text-gray-600 font-semibold">Content Refined</p>
          </div>
        </div>
      </div>

      {/* Main Bento Grid - Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          const colSpan = tool.size === 'large' ? 'lg:col-span-2' : tool.size === 'medium' ? 'md:col-span-2 lg:col-span-2' : '';
          const rowSpan = tool.size === 'large' ? 'lg:row-span-2' : '';

          return (
            <div
              key={tool.id}
              onClick={() => navigate(tool.path)}
              className={`glass-strong rounded-2xl p-6 border-2 border-gray-200/50 apple-shadow-lg hover:apple-shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden ${colSpan} ${rowSpan} animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.gradient} apple-shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  
                  {tool.badge && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <FaCheckCircle size={10} />
                      {tool.badge}
                    </span>
                  )}

                  <FaArrowRight className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>

                {/* Title & Description */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                {/* Features (for all cards) */}
                {tool.features && tool.features.length > 0 && (
                  <div className={`mt-4 pt-4 border-t border-gray-200/50 space-y-1.5 ${
                    tool.size === 'small' ? 'hidden lg:block' : ''
                  }`}>
                    {tool.features.slice(0, tool.size === 'large' ? 5 : 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tool.gradient} flex-shrink-0`}></div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <div className="glass-strong rounded-2xl p-6 border-2 border-cyan-200/50 apple-shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100">
            <FaClock className="text-cyan-600 text-lg" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="glass-subtle rounded-xl p-4 text-left hover:glass-strong transition-all duration-300 group border border-gray-200/50 hover:border-cyan-300/50 apple-shadow hover:apple-shadow-lg"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="text-cyan-600 text-lg group-hover:scale-110 transition-transform" />
                  <FaArrowRight className="ml-auto text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" size={12} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-gray-600 font-medium">{action.prompt}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="glass-strong rounded-2xl p-6 border-2 border-gray-200/50 apple-shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 glass-subtle rounded-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
              <FaInstagram className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Instagram post generated</p>
              <p className="text-xs text-gray-600">Just now</p>
            </div>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm font-medium">Start creating to see your activity here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
