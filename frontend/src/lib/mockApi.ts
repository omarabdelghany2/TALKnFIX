// Mock API for TALKnFIX - Replace with real API when backend is connected

interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  reputation: number;
  bio?: string;
  createdAt: string;
}

interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  title: string;
  content: string;
  images?: string[];
  visibility: "public" | "private";
  tags?: string[];
  reactionsCount: number;
  commentsCount: number;
  createdAt: string;
  userReaction?: string;
}

interface Comment {
  _id: string;
  author: {
    _id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

// Mock data
let mockUsers: User[] = [
  {
    _id: "1",
    username: "johndoe",
    email: "john@example.com",
    fullName: "John Doe",
    reputation: 1250,
    bio: "Full-stack developer passionate about open source",
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    username: "janesmit",
    email: "jane@example.com",
    fullName: "Jane Smith",
    reputation: 890,
    bio: "UX Designer | Tech enthusiast",
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    username: "mikebrown",
    email: "mike@example.com",
    fullName: "Mike Brown",
    reputation: 2340,
    bio: "DevOps Engineer | Cloud architect",
    createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let mockPosts: Post[] = [
  {
    _id: "1",
    author: mockUsers[0],
    title: "How to optimize React performance?",
    content: "<p>I've been working on a large React application and noticing some performance issues. What are the best practices for optimizing React apps in 2024?</p><p>I've tried React.memo and useMemo, but still seeing lag on complex components.</p>",
    visibility: "public",
    tags: ["react", "performance", "javascript"],
    reactionsCount: 24,
    commentsCount: 8,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    author: mockUsers[1],
    title: "Best UI design tools in 2024",
    content: "<p>What are your favorite design tools? I'm currently using Figma but wondering if there are better alternatives.</p>",
    visibility: "public",
    tags: ["design", "ui", "tools"],
    reactionsCount: 15,
    commentsCount: 12,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    author: mockUsers[2],
    title: "Docker vs Kubernetes: When to use what?",
    content: "<p>I'm setting up a new microservices architecture and trying to decide between Docker Compose and Kubernetes. What factors should I consider?</p>",
    visibility: "public",
    tags: ["devops", "docker", "kubernetes"],
    reactionsCount: 42,
    commentsCount: 18,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

let mockComments: { [postId: string]: Comment[] } = {
  "1": [
    {
      _id: "c1",
      author: mockUsers[2],
      content: "Try using React DevTools Profiler to identify the bottlenecks first!",
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: "c2",
      author: mockUsers[1],
      content: "Code splitting with React.lazy can make a huge difference for large apps.",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

// Current user (simulated login)
let currentUser: User | null = null;
const AUTH_TOKEN_KEY = "talknfix_token";

// Helper to generate mock token
const generateToken = () => `mock_token_${Date.now()}_${Math.random()}`;

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const user = mockUsers.find((u) => u.email === credentials.email);
    if (!user) throw new Error("Invalid credentials");
    currentUser = user;
    const token = generateToken();
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return { token, user };
  },
  
  register: async (data: { username: string; email: string; password: string; fullName: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (mockUsers.some((u) => u.email === data.email)) {
      throw new Error("Email already exists");
    }
    const newUser: User = {
      _id: String(mockUsers.length + 1),
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      reputation: 0,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    currentUser = newUser;
    const token = generateToken();
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return { token, user: newUser };
  },
  
  getMe: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!currentUser) {
      currentUser = mockUsers[0]; // Default to first user
    }
    return { user: currentUser };
  },
  
  logout: () => {
    currentUser = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

// Posts API
export const postsAPI = {
  getFeed: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { posts: mockPosts };
  },
  
  getById: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const post = mockPosts.find((p) => p._id === id);
    if (!post) throw new Error("Post not found");
    return { post };
  },
  
  create: async (data: FormData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newPost: Post = {
      _id: String(mockPosts.length + 1),
      author: currentUser!,
      title: data.get("title") as string,
      content: data.get("content") as string,
      visibility: data.get("visibility") as "public" | "private",
      tags: data.get("tags") ? (data.get("tags") as string).split(",") : [],
      reactionsCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockPosts.unshift(newPost);
    return { post: newPost };
  },
  
  update: async (id: string, data: FormData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const postIndex = mockPosts.findIndex((p) => p._id === id);
    if (postIndex === -1) throw new Error("Post not found");
    mockPosts[postIndex] = {
      ...mockPosts[postIndex],
      title: data.get("title") as string,
      content: data.get("content") as string,
      visibility: data.get("visibility") as "public" | "private",
      tags: data.get("tags") ? (data.get("tags") as string).split(",") : [],
    };
    return { post: mockPosts[postIndex] };
  },
  
  delete: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    mockPosts = mockPosts.filter((p) => p._id !== id);
    return { message: "Post deleted" };
  },
  
  search: async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const results = mockPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.content.toLowerCase().includes(query.toLowerCase())
    );
    return { posts: results };
  },
};

// Comments API
export const commentsAPI = {
  getByPostId: async (postId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { comments: mockComments[postId] || [] };
  },
  
  create: async (postId: string, content: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newComment: Comment = {
      _id: `c${Date.now()}`,
      author: currentUser!,
      content,
      createdAt: new Date().toISOString(),
    };
    if (!mockComments[postId]) mockComments[postId] = [];
    mockComments[postId].push(newComment);
    const postIndex = mockPosts.findIndex((p) => p._id === postId);
    if (postIndex !== -1) {
      mockPosts[postIndex].commentsCount++;
    }
    return { comment: newComment };
  },
};

// Reactions API
export const reactionsAPI = {
  toggle: async (postId: string, type: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const post = mockPosts.find((p) => p._id === postId);
    if (!post) throw new Error("Post not found");
    
    if (post.userReaction === type) {
      post.userReaction = undefined;
      post.reactionsCount = Math.max(0, post.reactionsCount - 1);
    } else {
      if (!post.userReaction) post.reactionsCount++;
      post.userReaction = type;
    }
    
    return { reaction: post.userReaction };
  },
};

// Users API
export const usersAPI = {
  getLeaderboard: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const sorted = [...mockUsers].sort((a, b) => b.reputation - a.reputation);
    return { users: sorted };
  },
  
  getProfile: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = mockUsers.find((u) => u._id === id);
    if (!user) throw new Error("User not found");
    const userPosts = mockPosts.filter((p) => p.author._id === id);
    return { user, posts: userPosts };
  },
  
  search: async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const results = mockUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.fullName.toLowerCase().includes(query.toLowerCase())
    );
    return { users: results };
  },
  
  getFriendRequests: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { requests: [] };
  },
  
  getFriends: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { friends: [] };
  },
};

// Projects interfaces
interface ProjectUpdate {
  _id: string;
  content: string;
  createdAt: string;
}

interface Project {
  _id: string;
  owner: {
    _id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  title: string;
  description: string;
  status: "done" | "in-progress" | "future";
  collaborators: {
    _id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  }[];
  updates: ProjectUpdate[];
  createdAt: string;
  updatedAt: string;
}

// Mock projects data
let mockProjects: Project[] = [
  {
    _id: "p1",
    owner: mockUsers[0],
    title: "React Performance Optimization Guide",
    description: "Comprehensive guide covering React performance best practices, profiling tools, and optimization techniques for large-scale applications.",
    status: "done",
    collaborators: [mockUsers[1]],
    updates: [
      {
        _id: "u1",
        content: "Completed chapter on React.memo and useMemo usage",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "u2",
        content: "Added code splitting examples and lazy loading patterns",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "u3",
        content: "Final review and published to documentation site",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "p2",
    owner: mockUsers[1],
    title: "Design System Implementation",
    description: "Building a comprehensive design system with reusable components, design tokens, and documentation for the company's product suite.",
    status: "in-progress",
    collaborators: [mockUsers[0], mockUsers[2]],
    updates: [
      {
        _id: "u4",
        content: "Created base component library structure",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "u5",
        content: "Implemented button, input, and card components with variants",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "u6",
        content: "Working on form components and validation patterns",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "p3",
    owner: mockUsers[2],
    title: "Kubernetes Migration Project",
    description: "Migrating our microservices architecture from Docker Compose to Kubernetes for better scalability and management.",
    status: "in-progress",
    collaborators: [],
    updates: [
      {
        _id: "u7",
        content: "Set up local Kubernetes cluster for testing",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "u8",
        content: "Created Helm charts for authentication service",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "p4",
    owner: mockUsers[0],
    title: "AI-Powered Code Review Tool",
    description: "Developing an AI tool that automatically reviews pull requests and suggests improvements based on best practices and team conventions.",
    status: "future",
    collaborators: [mockUsers[2]],
    updates: [
      {
        _id: "u9",
        content: "Initial research on LLM capabilities for code analysis",
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "p5",
    owner: mockUsers[1],
    title: "Mobile App Redesign",
    description: "Complete UI/UX overhaul of our mobile application with focus on accessibility and user engagement.",
    status: "future",
    collaborators: [],
    updates: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Projects API
export const projectsAPI = {
  getAll: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { projects: mockProjects };
  },

  getById: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const project = mockProjects.find((p) => p._id === id);
    if (!project) throw new Error("Project not found");
    return { project };
  },

  create: async (data: {
    title: string;
    description: string;
    status: "done" | "in-progress" | "future";
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newProject: Project = {
      _id: `p${mockProjects.length + 1}`,
      owner: currentUser!,
      title: data.title,
      description: data.description,
      status: data.status,
      collaborators: [],
      updates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProjects.unshift(newProject);
    return { project: newProject };
  },

  update: async (
    id: string,
    data: {
      title: string;
      description: string;
      status: "done" | "in-progress" | "future";
    }
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const projectIndex = mockProjects.findIndex((p) => p._id === id);
    if (projectIndex === -1) throw new Error("Project not found");
    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      title: data.title,
      description: data.description,
      status: data.status,
      updatedAt: new Date().toISOString(),
    };
    return { project: mockProjects[projectIndex] };
  },

  delete: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    mockProjects = mockProjects.filter((p) => p._id !== id);
    return { message: "Project deleted" };
  },

  addUpdate: async (projectId: string, content: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const project = mockProjects.find((p) => p._id === projectId);
    if (!project) throw new Error("Project not found");
    const newUpdate: ProjectUpdate = {
      _id: `u${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
    };
    project.updates.push(newUpdate);
    project.updatedAt = new Date().toISOString();
    return { update: newUpdate };
  },

  addCollaborator: async (projectId: string, userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const project = mockProjects.find((p) => p._id === projectId);
    if (!project) throw new Error("Project not found");
    const user = mockUsers.find((u) => u._id === userId);
    if (!user) throw new Error("User not found");
    if (project.collaborators.some((c) => c._id === userId)) {
      throw new Error("User already a collaborator");
    }
    project.collaborators.push({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
    });
    project.updatedAt = new Date().toISOString();
    return { collaborator: user };
  },

  removeCollaborator: async (projectId: string, userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const project = mockProjects.find((p) => p._id === projectId);
    if (!project) throw new Error("Project not found");
    project.collaborators = project.collaborators.filter((c) => c._id !== userId);
    project.updatedAt = new Date().toISOString();
    return { message: "Collaborator removed" };
  },
};

// Token management
export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(AUTH_TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(AUTH_TOKEN_KEY);
