const Report = require('../Models/Report');

// Advanced VIN Decode using Vehicle Databases API
const advancedVinDecode = async (req, res) => {
  try {
    const { vin } = req.body;

    // Validate VIN
    if (!vin) {
      return res.status(400).json({
        success: false,
        message: 'VIN is required'
      });
    }

    // Basic VIN validation (17 characters, excluding I, O, Q)
    const vinUpper = String(vin).toUpperCase().trim();
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    if (!vinRegex.test(vinUpper)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid VIN format. Must be 17 characters (no I, O, Q).'
      });
    }

    // Check if report already exists
    const existingReport = await Report.findOne({ vin: vinUpper });
    if (existingReport) {
      return res.json({
        success: true,
        message: 'Report already exists',
        data: existingReport.reportData,
        reportId: existingReport._id
      });
    }

    // Call Vehicle Databases Advanced VIN Decode API
    const apiKey = '7b361624c1ec11f09e6d0242ac120002';
    const apiUrl = `https://api.vehicledatabases.com/advanced-vin-decode/${vinUpper}`;

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-AuthKey': apiKey
      }
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return res.status(apiResponse.status).json({
        success: false,
        message: `API Error: ${apiResponse.status} - ${errorText || 'Failed to decode VIN'}`
      });
    }

    const apiData = await apiResponse.json();

    if (apiData.status !== 'success' || !apiData.data) {
      return res.status(400).json({
        success: false,
        message: apiData.message || 'Failed to decode VIN. Invalid or un-decodable VIN.'
      });
    }

    // Extract vehicle name from the response - handle nested structure
    // The API response has a dynamic key (trim/style) as first level, then basic.vehicle_name
    let vehicleName = 'Unknown Vehicle';
    
    // Helper function to safely get string value
    const getStringValue = (value) => {
      if (!value) return null;
      if (typeof value === 'string') return value.trim();
      if (typeof value === 'number') return String(value);
      if (typeof value === 'object') return null; // Skip objects
      return String(value).trim();
    };
    
    // FIRST: Check if data has a dynamic key structure (trim/style name as first key)
    const firstKey = Object.keys(apiData.data)[0];
    if (firstKey && apiData.data[firstKey] && typeof apiData.data[firstKey] === 'object') {
      const nestedData = apiData.data[firstKey];
      
      // Check nested basic.vehicle_name (this is the primary source)
      if (nestedData.basic && nestedData.basic.vehicle_name) {
        const basicVehicleName = getStringValue(nestedData.basic.vehicle_name);
        if (basicVehicleName && !basicVehicleName.includes('undefined')) {
          vehicleName = basicVehicleName;
        }
      }
      
      // SECOND: If basic.vehicle_name not found, try to construct from nested basic object
      if (vehicleName === 'Unknown Vehicle' && nestedData.basic) {
        const basicParts = [];
        const year = getStringValue(nestedData.basic.year);
        const make = getStringValue(nestedData.basic.make);
        const model = getStringValue(nestedData.basic.model);
        const trim = nestedData.basic.trim?.Trim ? getStringValue(nestedData.basic.trim.Trim) : null;
        
        if (year && !year.includes('undefined')) basicParts.push(year);
        if (make && !make.includes('undefined')) basicParts.push(make);
        if (model && !model.includes('undefined')) basicParts.push(model);
        if (trim && !trim.includes('undefined')) basicParts.push(trim);
        
        if (basicParts.length >= 2) {
          vehicleName = basicParts.join(' ');
        } else if (make && model) {
          vehicleName = `${make} ${model}`;
        }
      }
    }
    
    // THIRD: Check top-level basic.vehicle_name (if structure is different)
    if (vehicleName === 'Unknown Vehicle' && apiData.data.basic && apiData.data.basic.vehicle_name) {
      const basicVehicleName = getStringValue(apiData.data.basic.vehicle_name);
      if (basicVehicleName && !basicVehicleName.includes('undefined')) {
        vehicleName = basicVehicleName;
      }
    }
    
    // FOURTH: Try to construct from top-level basic object
    if (vehicleName === 'Unknown Vehicle' && apiData.data.basic) {
      const basicParts = [];
      const year = getStringValue(apiData.data.basic.year);
      const make = getStringValue(apiData.data.basic.make);
      const model = getStringValue(apiData.data.basic.model);
      const trim = apiData.data.basic.trim?.Trim ? getStringValue(apiData.data.basic.trim.Trim) : null;
      
      if (year && !year.includes('undefined')) basicParts.push(year);
      if (make && !make.includes('undefined')) basicParts.push(make);
      if (model && !model.includes('undefined')) basicParts.push(model);
      if (trim && !trim.includes('undefined')) basicParts.push(trim);
      
      if (basicParts.length >= 2) {
        vehicleName = basicParts.join(' ');
      } else if (make && model) {
        vehicleName = `${make} ${model}`;
      }
    }
    
    // FIFTH: Try top-level trim_and_style
    if (vehicleName === 'Unknown Vehicle') {
    const trimAndStyle = getStringValue(apiData.data.trim_and_style);
    if (trimAndStyle && !trimAndStyle.includes('undefined')) {
      vehicleName = trimAndStyle;
      }
    }
    
    // SIXTH: Build from top-level year, make, model, trim
    if (vehicleName === 'Unknown Vehicle') {
      const parts = [];
      
      const year = getStringValue(apiData.data.year);
      const make = getStringValue(apiData.data.make);
      const model = getStringValue(apiData.data.model);
      const trim = getStringValue(apiData.data.trim);
      
      if (year && !year.includes('undefined')) parts.push(year);
      if (make && !make.includes('undefined')) parts.push(make);
      if (model && !model.includes('undefined')) parts.push(model);
      if (trim && !trim.includes('undefined')) parts.push(trim);
      
      if (parts.length >= 2) {
        vehicleName = parts.join(' ');
      } else if (make && model) {
        vehicleName = `${make} ${model}`;
      } else if (apiData.data.vin) {
        vehicleName = `Vehicle - ${apiData.data.vin}`;
      }
    }

    // Get admin email from request body or use default
    const adminEmail = req.body.decodedBy || 'admin@system.com';

    // Save report to database
    const report = new Report({
      vin: vinUpper,
      vehicleName: vehicleName,
      reportData: apiData.data,
      decodedBy: adminEmail
    });

    await report.save();

    res.json({
      success: true,
      message: 'VIN decoded successfully and report saved',
      data: apiData.data,
      reportId: report._id,
      vehicleName: vehicleName
    });

  } catch (error) {
    console.error('Advanced VIN decode error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while decoding VIN'
    });
  }
};

// Get all reports
const getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    let filter = {};
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { vin: searchRegex },
        { vehicleName: searchRegex },
        { decodedBy: searchRegex }
      ];
    }

    const reports = await Report.find(filter)
      .sort({ decodedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('vin vehicleName decodedBy decodedDate createdAt updatedAt reportData');

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching reports'
    });
  }
};

// Get report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching report'
    });
  }
};

// Get report by VIN
const getReportByVin = async (req, res) => {
  try {
    const { vin } = req.params;
    const vinUpper = String(vin).toUpperCase().trim();

    const report = await Report.findOne({ vin: vinUpper });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found for this VIN'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Get report by VIN error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching report'
    });
  }
};

module.exports = {
  advancedVinDecode,
  getAllReports,
  getReportById,
  getReportByVin
};

