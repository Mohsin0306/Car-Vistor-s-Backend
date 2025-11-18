const VinRequest = require('../Models/VinRequest');
const User = require('../Models/User');
const { freeVinDecode } = require('./Free_VIN_Decode');
const { sendNotification, notifyAdmins } = require('../utils/notificationHelper');

// Create VIN Request
const createVinRequest = async (req, res) => {
  try {
    const { vin, userEmail } = req.body;

    // Validate required fields
    if (!vin || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'VIN and user email are required'
      });
    }

    // Basic VIN format validation (17 chars, excludes I, O, Q)
    const vinUpper = String(vin).toUpperCase().trim();
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    if (!vinRegex.test(vinUpper)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid VIN format. VIN must be 17 characters (no I, O, Q).'
      });
    }

    // Check if VIN request already exists for this user
    const existingRequest = await VinRequest.findOne({ 
      vin: vinUpper, 
      userEmail: userEmail.toLowerCase() 
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'VIN request already exists for this user'
      });
    }

    // Get vehicle details using free VIN decode
    const vinDecodeResponse = await fetch('http://localhost:3000/api/vin/decode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vin: vinUpper })
    });

    const vinDecodeData = await vinDecodeResponse.json();

    if (!vinDecodeData.success) {
      return res.status(400).json({
        success: false,
        message: vinDecodeData.message || 'Failed to decode VIN'
      });
    }

    // Create VIN request with vehicle details
    const vinRequest = new VinRequest({
      vin: vinUpper,
      userEmail: userEmail.toLowerCase(),
      vehicleDetails: vinDecodeData.data,
      status: 'pending',
      paymentAmount: 35
    });

    await vinRequest.save();

    try {
      const user = await User.findOne({ email: vinRequest.userEmail });
      if (user) {
        await sendNotification({
          recipientType: 'user',
          recipientId: user._id,
          title: 'VIN Request Submitted',
          message: `We received your VIN request for ${vinRequest.vin}. Our team is working on it.`,
          type: 'info',
          link: '/requests',
          metadata: { requestId: vinRequest._id },
        });
      }

      await notifyAdmins({
        title: 'New VIN Request',
        message: `${vinRequest.userEmail} submitted a request for ${vinRequest.vin}.`,
        type: 'info',
        link: `/admin/request/${vinRequest._id}`,
        metadata: { requestId: vinRequest._id },
      });
    } catch (notificationError) {
      console.error('VIN request notification error:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'VIN request created successfully',
      data: {
        id: vinRequest._id,
        vin: vinRequest.vin,
        userEmail: vinRequest.userEmail,
        vehicle: vinRequest.vehicleDetails.vehicle,
        status: vinRequest.status,
        requestDate: vinRequest.requestDate,
        paymentAmount: vinRequest.paymentAmount,
      },
    });

  } catch (error) {
    console.error('VIN request creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while creating VIN request'
    });
  }
};

// Get all VIN requests (for admin)
const getAllVinRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Add search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
      filter.$or = [
        { vin: searchRegex },
        { userEmail: searchRegex },
        { 'vehicleDetails.vehicle': searchRegex },
        { 'vehicleDetails.make': searchRegex },
        { 'vehicleDetails.model': searchRegex }
      ];
    }

    const requests = await VinRequest.find(filter)
      .sort({ requestDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VinRequest.countDocuments(filter);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get VIN requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching VIN requests'
    });
  }
};

// Get VIN request by ID
const getVinRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await VinRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'VIN request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Get VIN request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching VIN request'
    });
  }
};

// Update VIN request status
const updateVinRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    
    if (status === 'completed') {
      updateData.completedDate = new Date();
    }

    const request = await VinRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'VIN request not found'
      });
    }

    try {
      const user = await User.findOne({ email: request.userEmail });
      if (user) {
        await sendNotification({
          recipientType: 'user',
          recipientId: user._id,
          title: status
            ? `VIN Request ${status.charAt(0).toUpperCase() + status.slice(1)}`
            : 'VIN Request Updated',
          message:
            status === 'completed'
              ? `Your VIN request for ${request.vin} is complete. Download the report now.`
              : `Your VIN request for ${request.vin} was updated to "${request.status}".`,
          type: status === 'completed' ? 'success' : 'info',
          link: '/requests',
          metadata: { requestId: request._id },
        });
      }

      await notifyAdmins({
        title: 'VIN Request Updated',
        message: `${request.userEmail}'s request for ${request.vin} is now "${request.status}".`,
        type: 'info',
        link: `/admin/request/${request._id}`,
        metadata: { requestId: request._id },
      });
    } catch (notificationError) {
      console.error('VIN request status notification error:', notificationError);
    }

    res.json({
      success: true,
      message: 'VIN request updated successfully',
      data: request,
    });

  } catch (error) {
    console.error('Update VIN request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while updating VIN request'
    });
  }
};


// Get VIN requests by user email
const getVinRequestsByUser = async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const requests = await VinRequest.find({ userEmail: email.toLowerCase() })
      .sort({ requestDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VinRequest.countDocuments({ userEmail: email.toLowerCase() });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get user VIN requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching user VIN requests'
    });
  }
};

module.exports = {
  createVinRequest,
  getAllVinRequests,
  getVinRequestById,
  updateVinRequestStatus,
  getVinRequestsByUser
};
