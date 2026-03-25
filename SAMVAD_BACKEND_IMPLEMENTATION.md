# SAMVAD - Backend Implementation Examples

## 1. DATABASE MODELS (MongoDB + Mongoose)

### User Model
```typescript
// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  CITIZEN = 'citizen',
  STAFF = 'staff',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  department?: string; // for staff
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CITIZEN },
    profileImage: String,
    address: String,
    location: {
      lat: Number,
      lng: Number
    },
    department: String,
    permissions: [String],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastLogin: Date,
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
```

### Issue Model
```typescript
// src/models/Issue.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum IssueStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum IssueSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface IIssue extends Document {
  title: string;
  description: string;
  category: mongoose.Types.ObjectId;
  severity: IssueSeverity;
  status: IssueStatus;
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  images: Array<{
    url: string;
    uploadedAt: Date;
    caption?: string;
  }>;
  comments: Array<{
    userId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
  statusHistory: Array<{
    status: IssueStatus;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    reason?: string;
  }>;
  estimatedResolutionDate?: Date;
  actualResolutionDate?: Date;
  resolutionNotes?: string;
  upvotes: number;
  downvotes: number;
  views: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const issueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    severity: { type: String, enum: Object.values(IssueSeverity), default: IssueSeverity.MEDIUM },
    status: { type: String, enum: Object.values(IssueStatus), default: IssueStatus.PENDING },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
      city: String,
      state: String,
      zipCode: String
    },
    images: [{
      url: String,
      uploadedAt: { type: Date, default: Date.now },
      caption: String
    }],
    comments: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }],
    statusHistory: [{
      status: String,
      changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      changedAt: { type: Date, default: Date.now },
      reason: String
    }],
    estimatedResolutionDate: Date,
    actualResolutionDate: Date,
    resolutionNotes: String,
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    tags: [String],
    priority: { type: String, default: 'medium' }
  },
  { timestamps: true }
);

// Create indexes for better query performance
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ category: 1 });
issueSchema.index({ 'location.lat': '2dsphere', 'location.lng': '2dsphere' });

export default mongoose.model<IIssue>('Issue', issueSchema);
```

### Notification Model
```typescript
// src/models/Notification.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  issueId: mongoose.Types.ObjectId;
  type: 'status-change' | 'comment' | 'assignment' | 'update';
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  channel: ('email' | 'sms' | 'inApp')[];
  createdAt: Date;
  expiresAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    type: { type: String, enum: ['status-change', 'comment', 'assignment', 'update'] },
    title: String,
    message: String,
    data: Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
    channel: [{ type: String, enum: ['email', 'sms', 'inApp'] }],
    expiresAt: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) }
  },
  { timestamps: true }
);

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<INotification>('Notification', notificationSchema);
```

---

## 2. SERVICE LAYER

### AuthService
```typescript
// src/services/AuthService.ts
import User, { IUser, UserRole } from '../models/User';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errorHandler';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  name: string;
  phone: string;
  role?: UserRole;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private JWT_EXPIRE = '24h';
  private REFRESH_TOKEN_EXPIRE = '7d';

  // Generate tokens
  generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRE,
      algorithm: 'HS256'
    });

    const refreshToken = jwt.sign(payload, this.JWT_SECRET + '_refresh', {
      expiresIn: this.REFRESH_TOKEN_EXPIRE,
      algorithm: 'HS256'
    });

    return { accessToken, refreshToken };
  }

  // Verify token
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  // Register new user
  async register(payload: RegisterPayload): Promise<IUser> {
    const { email, password, name, phone, role } = payload;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      phone,
      role: role || UserRole.CITIZEN,
      permissions: this.getDefaultPermissions(role || UserRole.CITIZEN)
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    return userResponse;
  }

  // Login user
  async login(payload: LoginPayload) {
    const { email, password } = payload;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return { user, ...tokens };
  }

  // Get default permissions based on role
  private getDefaultPermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      [UserRole.CITIZEN]: ['view:issues', 'create:issue', 'comment:issue'],
      [UserRole.STAFF]: ['view:issues', 'update:issue', 'assign:issue'],
      [UserRole.ADMIN]: ['*']
    };

    return permissions[role];
  }
}

export default new AuthService();
```

### IssueService
```typescript
// src/services/IssueService.ts
import Issue, { IIssue, IssueStatus } from '../models/Issue';
import User from '../models/User';
import { AppError } from '../utils/errorHandler';

interface CreateIssuePayload {
  title: string;
  description: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  images?: string[];
  tags?: string[];
}

interface UpdateIssuePayload {
  status?: IssueStatus;
  assignedTo?: string;
  resolutionNotes?: string;
  estimatedResolutionDate?: Date;
}

export class IssueService {
  // Create new issue
  async createIssue(userId: string, payload: CreateIssuePayload): Promise<IIssue> {
    const issue = new Issue({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      location: payload.location,
      reportedBy: userId,
      images: payload.images?.map(url => ({ url, uploadedAt: new Date() })) || [],
      tags: payload.tags || [],
      statusHistory: [{
        status: IssueStatus.PENDING,
        changedBy: userId,
        changedAt: new Date()
      }]
    });

    return issue.save();
  }

  // Get all issues with filters
  async getIssues(filters: {
    status?: IssueStatus;
    category?: string;
    priority?: string;
    severity?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20, ...filterParams } = filters;
    const skip = (page - 1) * limit;

    const query = Issue.find(filterParams)
      .populate('reportedBy', 'name email profileImage')
      .populate('assignedTo', 'name email')
      .populate('category', 'name icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const issues = await query.exec();
    const total = await Issue.countDocuments(filterParams);

    return {
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get issue by ID
  async getIssueById(issueId: string): Promise<IIssue> {
    const issue = await Issue.findById(issueId)
      .populate('reportedBy', 'name email profileImage')
      .populate('assignedTo', 'name email')
      .populate('category', 'name icon')
      .populate('comments.userId', 'name profileImage');

    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    // Increment views
    issue.views += 1;
    await issue.save();

    return issue;
  }

  // Update issue
  async updateIssue(issueId: string, userId: string, payload: UpdateIssuePayload): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    if (payload.status && payload.status !== issue.status) {
      issue.status = payload.status;
      issue.statusHistory.push({
        status: payload.status,
        changedBy: userId,
        changedAt: new Date(),
        reason: payload.resolutionNotes
      });

      if (payload.status === IssueStatus.RESOLVED) {
        issue.actualResolutionDate = new Date();
      }
    }

    if (payload.assignedTo) {
      issue.assignedTo = payload.assignedTo;
      if (issue.status === IssueStatus.PENDING) {
        issue.status = IssueStatus.ASSIGNED;
      }
    }

    if (payload.resolutionNotes) {
      issue.resolutionNotes = payload.resolutionNotes;
    }

    if (payload.estimatedResolutionDate) {
      issue.estimatedResolutionDate = payload.estimatedResolutionDate;
    }

    return issue.save();
  }

  // Add comment to issue
  async addComment(issueId: string, userId: string, text: string): Promise<IIssue> {
    const issue = await Issue.findById(issueId);
    if (!issue) {
      throw new AppError('Issue not found', 404);
    }

    issue.comments.push({
      userId,
      text,
      createdAt: new Date()
    });

    return issue.save();
  }

  // Get nearby issues
  async getNearbyIssues(lat: number, lng: number, maxDistance: number = 5000) {
    return Issue.find({
      'location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistance
        }
      }
    }).populate('reportedBy', 'name').populate('category', 'name icon');
  }

  // Search issues
  async searchIssues(query: string) {
    return Issue.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
  }
}

export default new IssueService();
```

---

## 3. CONTROLLERS

### IssueController
```typescript
// src/controllers/issueController.ts
import { Request, Response, NextFunction } from 'express';
import IssueService from '../services/IssueService';
import { successResponse, errorResponse } from '../utils/response';
import { AppError } from '../utils/errorHandler';

export class IssueController {
  // Create issue
  async createIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, category, location, images, tags } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const issue = await IssueService.createIssue(userId, {
        title,
        description,
        category,
        location,
        images,
        tags
      });

      // Emit socket event for real-time update
      req.io?.emit('issue:created', issue);

      return successResponse(res, 'Issue created successfully', issue, 201);
    } catch (error) {
      next(error);
    }
  }

  // Get all issues
  async getIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, category, priority, severity, page, limit } = req.query;

      const issues = await IssueService.getIssues({
        status: status as any,
        category: category as string,
        priority: priority as string,
        severity: severity as string,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20
      });

      return successResponse(res, 'Issues retrieved successfully', issues);
    } catch (error) {
      next(error);
    }
  }

  // Get issue by ID
  async getIssueById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const issue = await IssueService.getIssueById(id);

      return successResponse(res, 'Issue retrieved successfully', issue);
    } catch (error) {
      next(error);
    }
  }

  // Update issue
  async updateIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { status, assignedTo, resolutionNotes, estimatedResolutionDate } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const updatedIssue = await IssueService.updateIssue(id, userId, {
        status,
        assignedTo,
        resolutionNotes,
        estimatedResolutionDate
      });

      // Emit socket event
      req.io?.emit('issue:updated', updatedIssue);

      return successResponse(res, 'Issue updated successfully', updatedIssue);
    } catch (error) {
      next(error);
    }
  }

  // Add comment
  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const issue = await IssueService.addComment(id, userId, text);

      req.io?.emit('issue:commented', issue);

      return successResponse(res, 'Comment added successfully', issue);
    } catch (error) {
      next(error);
    }
  }

  // Get nearby issues
  async getNearbyIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng, distance } = req.query;
      const issues = await IssueService.getNearbyIssues(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseInt(distance as string) || 5000
      );

      return successResponse(res, 'Nearby issues retrieved', issues);
    } catch (error) {
      next(error);
    }
  }

  // Search issues
  async searchIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      const issues = await IssueService.searchIssues(q as string);

      return successResponse(res, 'Search results', issues);
    } catch (error) {
      next(error);
    }
  }
}

export default new IssueController();
```

---

## 4. MIDDLEWARE

### Authentication Middleware
```typescript
// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import authService from '../services/AuthService';
import { AppError } from '../utils/errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = authService.verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Access denied', 403);
    }

    next();
  };
};
```

### Validation Middleware
```typescript
// src/middleware/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    req.body = value;
    next();
  };
};

// Validation schemas
export const schemas = {
  createIssue: Joi.object({
    title: Joi.string().required().min(10).max(200),
    description: Joi.string().required().min(20).max(5000),
    category: Joi.string().required(),
    location: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required()
    }).required(),
    images: Joi.array().items(Joi.string().uri()),
    tags: Joi.array().items(Joi.string())
  }),

  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    role: Joi.string().valid('citizen', 'staff', 'admin')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};
```

---

## 5. ROUTES

### IssueRoutes
```typescript
// src/routes/issue.routes.ts
import { Router } from 'express';
import issueController from '../controllers/issueController';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import { validateRequest, schemas } from '../middleware/validationMiddleware';

const router = Router();

// Create issue (authenticated citizens/staff)
router.post(
  '/',
  authMiddleware,
  validateRequest(schemas.createIssue),
  issueController.createIssue
);

// Get all issues (public)
router.get('/', issueController.getIssues);

// Get issue by ID (public)
router.get('/:id', issueController.getIssueById);

// Update issue (authenticated staff/admin)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['staff', 'admin']),
  issueController.updateIssue
);

// Add comment (authenticated users)
router.post('/:id/comment', authMiddleware, issueController.addComment);

// Get nearby issues
router.get('/map/nearby', issueController.getNearbyIssues);

// Search issues
router.get('/search/:q', issueController.searchIssues);

export default router;
```

---

## 6. UTILITIES

### Response Formatter
```typescript
// src/utils/response.ts
import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  timestamp: string;
}

export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  error?: any,
  statusCode: number = 500
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
    timestamp: new Date().toISOString()
  });
};
```

### Error Handler
```typescript
// src/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
  }
}

export const globalErrorHandler = (err: any, req: any, res: any, next: any) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Handle MongoDB validation error
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.message = Object.values(err.errors).map((err: any) => err.message).join(', ');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token';
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

---

## 7. SOCKET.IO EVENTS

### Socket Handler
```typescript
// src/socket/socketHandler.ts
import { Server, Socket } from 'socket.io';
import IssueService from '../services/IssueService';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen for issue updates
    socket.on('issue:subscribe', async (issueId) => {
      socket.join(`issue-${issueId}`);
    });

    // Broadcast issue update
    socket.on('issue:updated', async (data) => {
      io.to(`issue-${data.issueId}`).emit('issue:status-changed', data);
    });

    // Real-time notifications
    socket.on('notification:subscribe', (userId) => {
      socket.join(`user-${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
```

---

**This covers all backend implementation examples. React components and additional features follow in the next section.**
