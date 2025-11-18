const Notification = require('../Models/Notification');
const User = require('../Models/User');
const Admin = require('../Models/Admin');

const mapRecipientModel = (recipientType = 'user') =>
  recipientType === 'admin' ? 'Admin' : 'User';

const resolveRecipient = async ({ recipientType = 'user', recipientId, email }) => {
  const Model = recipientType === 'admin' ? Admin : User;

  if (recipientId) {
    const doc = await Model.findById(recipientId);
    if (!doc) return null;
    return { id: doc._id, model: mapRecipientModel(recipientType) };
  }

  if (email) {
    const doc = await Model.findOne({ email: email.toLowerCase() });
    if (!doc) return null;
    return { id: doc._id, model: mapRecipientModel(recipientType) };
  }

  return null;
};

const sendNotification = async ({
  recipientType = 'user',
  recipientId,
  email,
  title,
  message,
  type = 'info',
  link = '',
  metadata = {},
}) => {
  if (!title || !message) return null;

  const resolved = await resolveRecipient({ recipientType, recipientId, email });
  if (!resolved) return null;

  return Notification.create({
    recipientId: resolved.id,
    recipientModel: resolved.model,
    title,
    message,
    type,
    link,
    metadata,
  });
};

const notifyAdmins = async ({ title, message, type = 'info', link = '', metadata = {} }) => {
  const admins = await Admin.find({});
  if (!admins.length) return [];

  return Promise.all(
    admins.map((admin) =>
      sendNotification({
        recipientType: 'admin',
        recipientId: admin._id,
        title,
        message,
        type,
        link,
        metadata,
      })
    )
  );
};

module.exports = {
  sendNotification,
  notifyAdmins,
};

