const Notification = require('../Models/Notification');
const User = require('../Models/User');
const Admin = require('../Models/Admin');
const { sendNotification } = require('../utils/notificationHelper');

const formatError = (message) => ({
  success: false,
  message,
});

const mapModelName = (recipientType = 'user') =>
  recipientType === 'admin' ? 'Admin' : 'User';

exports.createNotification = async (req, res) => {
  try {
    const {
      recipientType = 'user',
      userId,
      email,
      title,
      message,
      type,
      link,
      metadata,
    } = req.body;

    if ((!userId && !email) || !title || !message) {
      return res
        .status(400)
        .json(formatError('recipient identifier, title and message are required'));
    }

    const notification = await sendNotification({
      recipientType,
      recipientId: userId,
      email,
      title,
      message,
      type,
      link,
      metadata,
    });

    if (!notification) {
      return res.status(404).json(formatError('Recipient not found'));
    }

    return res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return res.status(500).json(formatError('Failed to create notification'));
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, type: recipientType = 'user' } = req.query;

    let query = {
      recipientModel: mapModelName(recipientType),
    };

    if (userId) {
      query.recipientId = userId;
    } else if (email) {
      const Model = recipientType === 'admin' ? Admin : User;
      const user = await Model.findOne({ email });
      if (!user) {
        return res.status(404).json(formatError('Recipient not found'));
      }
      query.recipientId = user._id;
    } else {
      return res
        .status(400)
        .json(formatError('userId param or email query is required'));
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json(formatError('Failed to fetch notifications'));
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json(formatError('Notification not found'));
    }

    return res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json(formatError('Failed to update notification'));
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, type: recipientType = 'user' } = req.query;

    let query = {
      recipientModel: mapModelName(recipientType),
    };

    if (userId) {
      query.recipientId = userId;
    } else if (email) {
      const Model = recipientType === 'admin' ? Admin : User;
      const user = await Model.findOne({ email });
      if (!user) {
        return res.status(404).json(formatError('Recipient not found'));
      }
      query.recipientId = user._id;
    } else {
      return res
        .status(400)
        .json(formatError('userId param or email query is required'));
    }

    await Notification.updateMany(query, { read: true });

    return res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json(formatError('Failed to update notifications'));
  }
};

